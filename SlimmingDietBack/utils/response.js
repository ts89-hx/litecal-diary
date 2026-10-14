exports.successResponse = (data = null, message = '操作成功') => ({
    code: 200,
    msg: message,
    data,
});

exports.errorResponse = (message = '操作失败', statusCode = 400) => ({
    code: statusCode,
    msg: message,
}); 