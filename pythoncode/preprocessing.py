import joblib
import pandas as pd
import numpy as np

class rfrModel:
    def __init__(self, x_train, y_train, x_pred):
        x_train.replace(np.NAN, 'null', inplace=True)  # 无意义值均转为空，作为一类进行统计
        x_pred.replace(np.NAN, 'null', inplace=True)
        # self.x_train = x_train
        self.y_train = y_train
        # self.x_pred = x_pred

        # self.fe = dict()
        # df = x_pred
        # for i in list(df.columns):
        #     if df[i].dtypes == 'object':
        #         self.fe[i] = df.groupby(i).size() / len(df)

    # def preprocessing(self, df, drop_col):
    #     df = df.drop([drop_col], axis=1)
    #     df.replace(np.NAN, 'null', inplace=True)
    #     for i in list(df.columns):
    #         if df[i].dtypes == 'object':
    #             df.loc[:, i + '_label'] = df[i].map(self.fe[i])
    #             df = df.drop([i], axis=1)

        # 数据格式预处理
        x_train = x_train.drop(['product_id', 'product_name'], axis=1)
        x_pred = x_pred.drop(['product_id', 'product_name'], axis=1)
        # print(x_pred.info())
        for i in list(x_pred.columns):
            if x_pred[i].dtypes == 'object':
                fe = x_pred.groupby(i).size() / len(x_pred)
                x_train.loc[:, i + '_label'] = x_train[i].map(fe)
                x_train = x_train.drop([i], axis=1)
                x_pred.loc[:, i + '_label'] = x_pred[i].map(fe)
                x_pred = x_pred.drop([i], axis=1)
        print(x_pred)
        self.x_train = x_train
        self.x_pred = x_pred

    def train(self, model_name='rfr.model', random_state=71):
        # 随机森林

        from sklearn.ensemble import RandomForestClassifier
        rfr = RandomForestClassifier(random_state=random_state)
        rfr.fit(self.x_train, self.y_train.values.ravel())
        joblib.dump(filename=model_name, value=rfr)

    def predict(self, model_name='rfr.model'):
        rfr = joblib.load(model_name)
        # y_pred = rfr.predict(self.x_pred)
        y_pred = rfr.predict_proba(self.x_pred)
        # print(y_pred)
        return y_pred[:, 1]