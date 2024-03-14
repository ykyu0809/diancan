import json

def response_return(code, msg, data):
    """[summary]
    Args:
        code ([type]): 200(请求成功),404(请求失败),500(服务器出错)
        msg ([type]): msg
        data ([type]): json_data
    Returns:
        [type]: [description]
    """
    if data == None:
        data = []
    return json.dumps({'code': code, 'msg': msg, 'data': data}, ensure_ascii=False)