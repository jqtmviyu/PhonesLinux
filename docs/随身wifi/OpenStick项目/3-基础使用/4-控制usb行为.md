# 控制usb行为

## 控制usb device模式下的行为

OpenStick 提供的所有系统都使用基于libusbgx的Gadget Controller (以下简称gc)来管理usb在device模式下的行为。  
Debian默认通过/usr/sbin/mobian-usb-network-config脚本启动rndis和adb两种usb复合设备，这也就意味着如果你的设备安装的是Debian，插入电脑默认会出现两个设备。  
HandsomeMod 通过uci来调用gc，用户可以通过luci来控制gc。  
在Debian中，rndis建立的usb0网络通过networkmanager进行管理，dnsmasq作为dhcp server分配ip地址。  
你也可以通过以下指令（例子）来加入更多的功能（同时运行不同功能的种类是有限的，受限于硬件）。  
****注意：在windows下rndis必须为第一个加入gadget中的功能，且windows不支持动态更新gadget，只能在脚本中一次添加完所有的gadget。****  
以下指令需要root权限,重启后失效。

```
    # 列出当前usb活动的device
    gc -l
    # 加入一个串口设备
    # 有效的关键字为 serial ffs hid midi printer uvc mass rndis ecm acm
    gc -a serial
    # 删除指定串口设备 （X 为列表中的对应的config名称）
    gc -r serial.X
    # 清除所有的gadget
    gc -c
    # 关闭gadget
    gc -d
    # 开启gadget
    gc -e
```

## 切换USB工作模式

OpenStick没有usb-id脚，只能手动将usb切换为主模式来插入u盘等设备，你可以将以下语句加入 **/usr/sbin/mobian-usb-gadget** setup()的最开头来实现开机切换，所有usb device功能将会失效。

```
echo host > /sys/kernel/debug/usb/ci_hdrc.0/role
```

当然也可以通过把usb-typea头改为mircousb头，然后把vol up(fb)触点的gpio接到usb-id实现自动切换(需修改设备树)。

## 关于 Gadget Controller

Gadget Controller 的开发时间有点短，可能不够成熟。。。  
欢迎star、提出issue和pull request来帮助我完善它~