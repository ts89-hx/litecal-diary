require('dotenv').config();

const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const User = require('../models/user');
const { successResponse, errorResponse } = require('../utils/response');
const { VerificationCode } = require('../models');
const { Op } = require('sequelize');
const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const maskValue = (value, visiblePrefix = 3, visibleSuffix = 3) => {
  if (!value || typeof value !== 'string') {
    return value || '';
  }

  if (value.length <= visiblePrefix + visibleSuffix) {
    return value;
  }

  return `${value.slice(0, visiblePrefix)}***${value.slice(-visibleSuffix)}`;
};

const logAuth = (scope, message, payload) => {
  if (payload !== undefined) {
    console.log(`[auth:${scope}] ${message}`, payload);
    return;
  }

  console.log(`[auth:${scope}] ${message}`);
};

// 创建阿里云短信客户端
const createClient = () => {
  const config = new OpenApi.Config({
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    endpoint: 'dysmsapi.aliyuncs.com'
  });
  return new Dysmsapi20170525.default(config);
};

logAuth('init', '短信与微信登录配置已加载', {
  aliyunAccessKeyConfigured: Boolean(process.env.ALIYUN_ACCESS_KEY_ID),
  aliyunSecretConfigured: Boolean(process.env.ALIYUN_ACCESS_KEY_SECRET),
  wechatAppId: maskValue(process.env.WECHAT_APP_ID),
  wechatSecretConfigured: Boolean(process.env.WECHAT_APP_SECRET),
  jwtSecretConfigured: Boolean(process.env.JWT_SECRET)
});

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log('Login attempt:', username);
        const user = await User.findOne({ where: { username } });
        if (user && user.password === password) {
            const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '7d' });
            return res.json(successResponse({ accessToken: token }, '登录成功'));
        }
        return res.status(401).json(errorResponse('用户名或密码错误'));
    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json(errorResponse('服务器错误'));
    }
};

exports.sendVerificationCode = async (req, res) => {
  const { phoneNumber } = req.body;
  const verificationCode = generateVerificationCode(); // 动态生成验证码

  try {
    logAuth('sms', '收到验证码发送请求', {
      phoneNumber: maskValue(phoneNumber),
      requestTime: new Date().toISOString()
    });

    // 检查是否在短时间内重复请求
    const recentCode = await VerificationCode.findOne({
      where: {
        phone_number: phoneNumber,
        created_at: {
          [Op.gt]: new Date(Date.now() - 5 * 1000) // 5秒 内不允许重复请求
        }
      }
    });

    if (recentCode) {
      logAuth('sms', '验证码请求过于频繁，已拦截', {
        phoneNumber: maskValue(phoneNumber)
      });
      return res.status(429).json(errorResponse('请求过于频繁，请稍后再试'));
    }

    const client = createClient();

    // 构造请求对象
    const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: phoneNumber,
      signName: process.env.ALIYUN_SIGN_NAME,
      templateCode: process.env.ALIYUN_TEMPLATE_CODE,
      templateParam: JSON.stringify({ code: verificationCode })
    });

    // 发送 API 请求
    const runtime = new Util.RuntimeOptions({});
    const sendSmsResponse = await client.sendSmsWithOptions(sendSmsRequest, runtime);

    logAuth('sms', '短信服务返回结果', {
      phoneNumber: maskValue(phoneNumber),
      code: sendSmsResponse.body.code,
      message: sendSmsResponse.body.message,
      bizId: sendSmsResponse.body.bizId
    });

    if (sendSmsResponse.body.code !== 'OK') {
      throw new Error(`发送失败: ${sendSmsResponse.body.message}`);
    }

    // 存储验证码到数据库
    await VerificationCode.create({
      phone_number: phoneNumber,
      code: verificationCode
    });

    logAuth('sms', '验证码已写入数据库', {
      phoneNumber: maskValue(phoneNumber)
    });

    return res.json(successResponse(null, '验证码已发送'));
  } catch (err) {
    console.error('发送验证码错误:', err.message);
    return res.status(500).json(errorResponse('发送验证码失败'));
  }
};

exports.verifyAndLogin = async (req, res) => {
  const { phoneNumber, verificationCode } = req.body;
  try {
    logAuth('phone-login', '收到手机号登录请求', {
      phoneNumber: maskValue(phoneNumber),
      verificationCode: maskValue(verificationCode, 0, 2)
    });

    // 从数据库中获取存储的验证码
    const record = await VerificationCode.findOne({
      where: {
        phone_number: phoneNumber,
        code: verificationCode,
        // created_at: {
        //   [Op.gt]: new Date(Date.now() - 300 * 60 * 1000) // 验证码有效期5分钟
        // }
      }
    });

    if (!record) {
      logAuth('phone-login', '验证码校验失败', {
        phoneNumber: maskValue(phoneNumber)
      });
      return res.status(401).json(errorResponse('验证码错误或已过期'));
    }

    logAuth('phone-login', '验证码校验通过', {
      phoneNumber: maskValue(phoneNumber)
    });

    // 验证成功后，删除验证码
    // await VerificationCode.destroy({ where: { id: record.id } });

    // 查找或创建用户
    let user = await User.findOne({ where: { username: phoneNumber } });

    if (!user) {
    //   const hashedPassword = await bcrypt.hash('', 10); // 空密码哈希
      user = await User.create({
        name: `用户${phoneNumber}`,
        username: phoneNumber,
        password: '',
        userType: 'user'
      });
      logAuth('phone-login', '已创建新用户', {
        userId: user.id,
        username: user.username
      });
    } else {
      logAuth('phone-login', '命中已有用户', {
        userId: user.id,
        username: user.username
      });
    }

    // 生成 token
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    logAuth('phone-login', '手机号登录成功', {
      userId: user.id,
      tokenGenerated: Boolean(token)
    });

    return res.json(successResponse({ user, accessToken: token }, '登录成功'));
  } catch (err) {
    console.error('登录错误:', err.message);
    return res.status(500).json(errorResponse('服务器错误'));
  }
};

exports.verifyCode = async (req, res) => {
    const { phoneNumber, code } = req.body;
    try {
        const verificationCode = await VerificationCode.findOne({
            where: {
                phone_number: phoneNumber,
                code: code,
                // created_at: {
                //     [Op.gt]: new Date(Date.now() - 300 * 60 * 1000) // 5分钟内有效
                // }
            }
        });

        if (!verificationCode) {
            return res.status(400).json({ error: '验证码无效或已过期' });
        }

        // 验证成功后的逻辑
        return res.json({ success: true, message: '验证成功' });
    } catch (err) {
        console.error('验证错误:', err.message);
        return res.status(500).json({ error: '验证失败' });
    }
};

exports.createVerificationCode = async (req, res) => {
    const { phoneNumber, code } = req.body;
    try {
        await VerificationCode.create({
            phone_number: phoneNumber,
            code: code,
            created_at: new Date() // 确保设置当前时间
        });
        return res.json({ success: true, message: '验证码已创建' });
    } catch (err) {
        console.error('创建验证码错误:', err.message);
        return res.status(500).json({ error: '创建验证码失败' });
    }
};

exports.wechatLogin = async (req, res) => {
    const { code, userInfo = {} } = req.body;

    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;
    if (!code || !appId || !appSecret) return res.status(400).json({ error: '微信登录参数或服务配置不完整' });

    try {
        logAuth('wechat', '收到微信登录请求', {
            hasCode: Boolean(code),
            codePreview: maskValue(code, 6, 4),
            nickName: userInfo?.nickName || '',
            avatarProvided: Boolean(userInfo?.avatarUrl),
            appId: maskValue(appId)
        });

        // 使用微信提供的 API 获取 openid 和 session_key
        const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
            timeout: 8000,
            params: {
                appid: appId,
                secret: appSecret,
                js_code: code,
                grant_type: 'authorization_code'
            }
        });

        const { openid, session_key } = response.data;

        logAuth('wechat', '微信 jscode2session 返回结果', {
            errcode: response.data.errcode,
            errmsg: response.data.errmsg,
            openid: maskValue(openid, 6, 4),
            sessionKeyReceived: Boolean(session_key)
        });

        if (!openid) {
            logAuth('wechat', '未获取到 openid，微信登录失败', response.data);
            return res.status(400).json({ success: false, message: '微信登录失败' });
        }

        // 检查用户是否已存在
        let user = await User.findOne({ where: { wechat_open_id: openid } });

        logAuth('wechat', '数据库用户查询结果', {
            openid: maskValue(openid, 6, 4),
            userExists: Boolean(user)
        });

        if (!user) {
            // 生成唯一的用户名
            let baseUsername = userInfo.nickName || '微信用户';
            let uniqueUsername = baseUsername;

            while (await User.findOne({ where: { username: uniqueUsername } })) {
                uniqueUsername = `${baseUsername}_${uuidv4().slice(0, 8)}`; // 使用 uuid 生成唯一后缀
            }

            // 如果用户不存在，创建新用户
            user = await User.create({
                wechat_open_id: openid,
                username: uniqueUsername, // 使用唯一的用户名
                avatar: userInfo.avatarUrl || '', // 使用微信头像
                password: '' // 密码为空字符串
            });
            logAuth('wechat', '已创建新的微信用户', {
                userId: user.id,
                username: user.username,
                openid: maskValue(openid, 6, 4)
            });
        } else {
            // 更新用户信息
            user.username = userInfo.nickName || user.username;
            user.avatar = userInfo.avatarUrl || user.avatar;
            await user.save();
            logAuth('wechat', '已更新现有微信用户信息', {
                userId: user.id,
                username: user.username,
                openid: maskValue(openid, 6, 4)
            });
        }

        // 生成访问令牌
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'litecal-demo-secret', { expiresIn: '7d' });

        logAuth('wechat', '微信登录成功', {
            userId: user.id,
            tokenGenerated: Boolean(token)
        });

        return res.json({ success: true, userId: user.id, accessToken: token });
    } catch (error) {
        console.error('微信登录错误:', error);
        return res.status(500).json({ success: false, message: '服务器错误' });
    }
};
