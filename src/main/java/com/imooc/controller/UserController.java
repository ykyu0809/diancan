package com.imooc.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.imooc.VO.ProductVO;
import com.imooc.VO.ResultVO;
import com.imooc.dataobject.ProductInfo;
import com.imooc.dataobject.User;
import com.imooc.enums.ResultEnum;
import com.imooc.exception.SellException;
import com.imooc.form.UserForm;
import com.imooc.repository.UserRepository;
import com.imooc.service.ProductService;
import com.imooc.utils.ResultVOUtil;

import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;


/**
 * 用户相关
 */
@RestController
@RequestMapping("/user")
@Slf4j
public class UserController {

    @Autowired
    UserRepository repository;

    @Autowired
    private ProductService productService;

    //创建订单
    @PostMapping("/save")
    public ResultVO create(@Valid UserForm userForm,
                           BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            log.error("参数不正确, userForm={}", userForm);
            throw new SellException(ResultEnum.PARAM_ERROR.getCode(),
                    bindingResult.getFieldError().getDefaultMessage());
        }
        User userOld = repository.findByOpenid(userForm.getOpenid());
        User user = new User();
        if (userOld != null) {
            user.setId(userOld.getId());
        }
        user.setUsername(userForm.getUsername());
        user.setOpenid(userForm.getOpenid());
        user.setPhone(userForm.getPhone());
        user.setZhuohao(userForm.getZhuohao());
        user.setRenshu(userForm.getRenshu());

        return ResultVOUtil.success(repository.save(user));
    }

    // 获取openid
    @RequestMapping("/get_openid")
    public String getOpenidInfo(@RequestParam(name = "code") String code) throws Exception {
        System.out.println("code" + code);
        String url = "https://api.weixin.qq.com/sns/jscode2session";
        url += "?appid=wx562c34e0087c5d0c";//自己的appid
        url += "&secret=3165c6108893365e55e2186a0021eb9e";//自己的appSecret
        url += "&js_code=" + code;
        url += "&grant_type=authorization_code";
        url += "&connect_redirect=1";
        String res = null;
        CloseableHttpClient httpClient = HttpClientBuilder.create().build();
        // DefaultHttpClient();
        //System.out.println(url);
        HttpGet httpget = new HttpGet(url);    //GET方式
        CloseableHttpResponse response = null;
        // 配置信息
        RequestConfig requestConfig = RequestConfig.custom()          // 设置连接超时时间(单位毫秒)
                .setConnectTimeout(5000)                    // 设置请求超时时间(单位毫秒)
                .setConnectionRequestTimeout(5000)             // socket读写超时时间(单位毫秒)
                .setSocketTimeout(5000)                    // 设置是否允许重定向(默认为true)
                .setRedirectsEnabled(false).build();           // 将上面的配置信息 运用到这个Get请求里
        httpget.setConfig(requestConfig);                         // 由客户端执行(发送)Get请求
        response = httpClient.execute(httpget);                   // 从响应模型中获取响应实体
        HttpEntity responseEntity = response.getEntity();
        System.out.println("响应状态为：" + response.getStatusLine());
        if (responseEntity != null) {
            res = EntityUtils.toString(responseEntity);
            System.out.println("响应内容长度为：" + responseEntity.getContentLength());
            System.out.println("响应内容为：" + res);
        }
        // 释放资源
        if (httpClient != null) {
            httpClient.close();
        }
        if (response != null) {
            response.close();
        }
        JSONObject jo = JSON.parseObject(res);
        String openid = jo.getString("openid");
        System.out.println("openid：" + openid);
        return openid;
    }

    @GetMapping("/getUserInfo")
    public ResultVO getUserInfo(@RequestParam("openid") String openid) {
        User user = repository.findByOpenid(openid);
        return ResultVOUtil.success(user);
    }

    /**
     * 随机挑选12样菜品，返回给前端
     */
    @GetMapping("/getProductInfo")
    public ResultVO getProductInfo() {
        List<ProductInfo> productInfoList = productService.findUpAll();
//        System.out.println(productInfoList);
        List<ProductInfo> randomProduct = new ArrayList<>();
        int sum = productInfoList.size();  // 统计菜单数
        if(sum <= 12){  // 防止因菜品不够而在之后的while中陷入死循环
            System.out.println("菜品不够，无法实现推荐");
            return ResultVOUtil.error(400, "小店的菜品太少了");
        }
        Random random = new Random();
        HashSet<Integer> index=new HashSet<>();  // HashSet只能存放不同的值
        while(index.size()<12){  // 随机生成12样菜品
            index.add(random.nextInt(sum)); // 获取0至sum的随机数
        }
        for (Integer i : index) {
//            System.out.println(productInfoList.get(i));
            randomProduct.add(productInfoList.get(i));
        }
        return ResultVOUtil.success(randomProduct);
    }

}
