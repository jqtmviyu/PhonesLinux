# 随身wifi通过路由器的usb口上网

一般来说, 设备都是通过连路由器wifi来上网的, 但410随身比较特殊, 如果你不用它插sim卡上网, 而是连wifi, 会遇到几种情况

* 410 发烫, ssh容易掉线
* debian系统连接部分品牌的路由wifi速度很慢(例如小米r1c), 远远比不上手机热点
* openwrt系统的上行速率只有1M(驱动问题)

但换成usb, 速度至少能跑到60M-100M, 因为不需要wifi工作, 发热也非常低

网络图如下:

![](https://img.hellohxx.top/202311120846991.png)

## 随身wifi设置

==先设置随身wifi, 设置完再插到路由上.==

1. 编辑 br-lan 接口

![](https://img.hellohxx.top/202311230156876.png)  

2. 把网关设置成后面路由分配到的地址, 这样就会通过路由访问外网

![](https://img.hellohxx.top/202403172118767.png)  
3. 添加dns, 一个是路由的ip, 一个是阿里的dns

![](https://img.hellohxx.top/202403172118592.png)  
4. 编辑dns文件

```sh
rm -rf /etc/resolv.conf
vim /etc/resolv.conf
===
search lan
nameserver 127.0.0.1
nameserver ::1
nameserver 223.5.5.5
nameserver 192.168.2.1
===
chmod -w /etc/resolv.conf
```

5. 把随身wifi插到路由上

## 路由器设置

1. 添加一个usb接口, 设备选 usb0, 协议选静态地址

![](https://img.hellohxx.top/202403172118000.png)

2. ipv4 地址填 192.168.3.2, 和上面的网关对应  

![](https://img.hellohxx.top/202403172118343.png)

3. 取消 强制链路和默认网关

![](https://img.hellohxx.top/202403172118918.png)  

4. 防火墙选 lan

![](https://img.hellohxx.top/202403172119262.png)
