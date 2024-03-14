from flask import Flask
from flask import request
from sysSql import Mysqlpython
from preprocessing import rfrModel
import json
import numpy as np
import pandas as pd
import util

#显示所有列
pd.set_option('display.max_columns',None)
#显示所有行
# pd.set_option('display.max_rows',None)
#设置value的显示长度
pd.set_option('max_colwidth',100)
#设置1000列时才换行
pd.set_option('display.width',1000)

# Flask初始化参数尽量使用你的包名，这个初始化方式是官方推荐的，官方解释：http://flask.pocoo.org/docs/0.12/api/#flask.Flask
app = Flask(__name__)

@app.route('/hello')
def hello_world():
    return "Hello World!"

@app.route('/recommend_food', methods=['POST'])
def recommend_food():
    # try:
        postdata = request.values.get('delicacies')
        # print(json.loads(postdata))  # 注意这里哈
        postdata = json.loads(postdata)  # 注意这里哈，变回DICT格式，亲切ing
        # print(type(postdata))
        # print(type(postdata[0]))

        length = len(postdata)
        sql = "SELECT * FROM product_target WHERE product_id in ("
        productId = ()
        choose = []
        for i in range(length):
            # postdata[i] = {
            #     'productId': postdata[i]['productId'],
            #     'productName': postdata[i]['productName'],
            #     'choose': postdata[i]['choose']
            # }
            # print(postdata[i])
            if i < length - 1:
                sql = sql + "'" + postdata[i]['productId'] + "', "
            else:
                sql = sql + "'" + postdata[i]['productId'] + "')"
            # productId.append(postdata[i]['productId'])
            choose.append(str(postdata[i]['choose']))
        # print(sql)
        features_train = connSql.Search(sql)
        features_train = pd.DataFrame(features_train, columns=['product_id', 'product_name', 'sour', 'sweet', 'spicy', 'salty', 'fresh', 'ingredient1', 'ingredient2', 'cooking', 'calories'])
        choose_train = pd.DataFrame(choose, columns=['choose'])
        # print(features_train.info())
        # print(choose_train.info())

        # 训练与预测
        filename = 'rfr.model'
        rfr = rfrModel(features_train, choose_train, product_target)
        rfr.train(model_name=filename, random_state=110)
        y_pred = rfr.predict(model_name=filename)
        # for i in range(y_pred.shape[0]):
        #     print(product_target.iloc[i, 1], y_pred[i])

        # 获取预测菜品的id, name, picUrl，拼接成一个df后以choose为关键字降序排列，输出概率最高的12样菜品
        sql = "SELECT * FROM product_info "  # 写SQL语句
        product_info = connSql.Search(sql)
        product_info = pd.DataFrame(product_info)
        # print(product_info.info())
        # print(product_info)
        product_info = product_info.iloc[:, 0:6]
        # print(product_info)
        y_pred = pd.DataFrame(y_pred)

        df = pd.concat([product_info, y_pred], axis = 1)
        df.columns = ['product_id', 'product_name', 'product_price', 'product_stock', 'product_description', 'productIcon', 'choose']
        df = df.sort_values(by='choose', ascending=False, axis=0)
        df.reset_index(drop=True, inplace=True)
        print(df)
        # print(df.info())

        # 将DataFrame转为嵌套字典的列表，返回到微信小程序端
        postdata = []
        for i in range(length):
            postdata.append({
                'productId': df.loc[i, 'product_id'],
                'productName': df.loc[i, 'product_name'],
                'price': float(df.loc[i, 'product_price']),
                'stock': int(df.loc[i, 'product_stock']),
                'desc': df.loc[i, 'product_description'],
                'productIcon': df.loc[i, 'productIcon']
            })
            # print(postdata[i])

        return util.response_return(code='200', msg='成功', data=postdata)

    # except Exception as e:
    #     return util.response_return(code='500', msg='Unknown server error', data=None)

if __name__ == "__main__":

    connSql = Mysqlpython(database='sell', host='127.0.0.1', user="root",
                          password='asdfghjkl', port=3306, charset="utf8")
    # sql = "SELECT * FROM product_info "  # 写SQL语句
    # product_info = connSql.Search(sql)
    sql = "SELECT * FROM product_target "  # 写SQL语句
    product_target = connSql.Search(sql)
    product_target = pd.DataFrame(product_target, columns=['product_id', 'product_name', 'sour', 'sweet', 'spicy', 'salty', 'fresh', 'ingredient1', 'ingredient2', 'cooking', 'calories'])
    # print(features.info())
    '''  将菜品表的菜品同步到属性表
    # 属性表字段名：product_id, product_name, sour, sweet, spicy, salty, fresh, ingredient1, ingredient2, cooking, calories
    for i in features:
        # print(i)
        pid = i[0]
        pname = i[1]
        sql = "INSERT IGNORE INTO product_target (product_id, product_name) VALUES ('" + pid + "', '" + pname + "');"  # 防重复插入
        # sql = "INSERT INTO product_target (product_id, product_name) VALUES ('" + pid + "', '" + pname + "');"
        # print(sql)
        connSql.Operation(sql)
    '''
    app.run(host="0.0.0.0", port=8090)