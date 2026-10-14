const {spawn}=require('child_process');
const fs=require('fs');
const path=require('path');
const readline=require('readline');
const root=path.resolve(__dirname,'../..');
let worker=null,starting=null,ready=false,nextId=0;
const pending=new Map();

function stop() { if(worker)worker.kill(); }
function start() {
    if(ready&&worker)return Promise.resolve();
    if(starting)return starting;
    const python=process.env.FOOD_PYTHON_PATH||path.join(root,'.venv-food',process.platform==='win32'?'Scripts/python.exe':'bin/python');
    const modelDir=process.env.FOOD_MODEL_DIR||path.join(root,'model-assets/chinese-clip');
    if(!fs.existsSync(python))return Promise.reject(new Error('本地识别环境未安装，请先运行模型安装步骤'));
    if(!fs.existsSync(path.join(modelDir,'pytorch_model.bin')))return Promise.reject(new Error('本地识别模型尚未下载完成，请稍后重试或手动添加'));
    starting=new Promise((resolve,reject)=>{
        worker=spawn(python,['-X','utf8',path.join(__dirname,'local_worker.py')],{cwd:root,windowsHide:true,env:{...process.env,FOOD_MODEL_DIR:modelDir},stdio:['pipe','pipe','pipe']});
        const child=worker;
        const fail=error=>{if(worker!==child)return;clearTimeout(timer);ready=false;worker=null;starting=null;reject(error);for(const task of pending.values()){clearTimeout(task.timer);task.reject(error);}pending.clear();};
        const timer=setTimeout(()=>{fail(new Error('本地模型启动超时，请稍后重试'));child.kill();},120000);
        readline.createInterface({input:child.stdout}).on('line',line=>{
            let result;try{result=JSON.parse(line);}catch(_error){return;}
            if(result.type==='ready'){clearTimeout(timer);ready=true;starting=null;resolve();return;}
            if(result.type==='fatal'){fail(new Error(result.error));child.kill();return;}
            const task=pending.get(result.id);if(!task)return;
            clearTimeout(task.timer);pending.delete(result.id);
            result.error?task.reject(new Error(result.error)):task.resolve(result.candidates||[]);
        });
        // Never log input data. Only local library diagnostics arrive on stderr.
        child.stderr.on('data',chunk=>{if(process.env.FOOD_MODEL_DEBUG==='true')console.error(String(chunk));});
        child.on('error',()=>fail(new Error('无法启动本地识别进程，请检查Python配置')));
        child.on('exit',()=>fail(new Error('本地识别进程已退出，请重试')));
    });
    return starting;
}
let inFlight=0;
async function recognize(imageBuffer) {
    if(!Buffer.isBuffer(imageBuffer)||!imageBuffer.length||imageBuffer.length>4*1024*1024)throw new Error('请选择4MB以内的食物图片');
    if(inFlight>=2)throw new Error('识别服务繁忙，请稍后重试');
    inFlight++;
    try {
        await start();
        return await new Promise((resolve,reject)=>{
            const id=++nextId;
            const timer=setTimeout(()=>{pending.delete(id);reject(new Error('本地识别超时，请重试'));stop();},30000);
            pending.set(id,{resolve,reject,timer});
            worker.stdin.write(JSON.stringify({id,image:imageBuffer.toString('base64')})+'\n',error=>{
                if(error){clearTimeout(timer);pending.delete(id);reject(new Error('无法向本地模型发送图片'));}
            });
        });
    } finally {inFlight--;}
}
module.exports={recognize,start,stop};
