# Debian基础使用

## 基本信息

- Debian 11 bulleye 稳定版
- Linux Kernel 5.15 LTS
- 装了一些bookworm的包（modemman  
    ager）和mobian的fork，暂时不知道会给后续更新带来什么影响。
- 开机默认启动rndis与adbd，可以通过adb与ssh连接（ip地址为192.168.68.1）
- 默认配置了modem连接，插卡即有网。
- 默认hostname为openstick
- 默认用户名 user 密码 1
- 内核支持挂无线网卡和uvc摄像头，docker与anbox。

## 连接到OpenStick

支持使用任何支持openssh协议的工具以及adb来连接到OpenStick的shell。

- 在windows下很多带颜色的字符会在adb下显示不出来，建议使用ssh进行连接。
- adb fork自安卓4.4 不支持adb install 等涉及安卓图形界面或软件管理的指令。

### 使用adb

```
    # 进入bash
    $ adb shell
    # 也可以通过reboot bootloader进入到fastboot模式
    $ adb reboot bootloader
```

### 使用ssh

```
    $ ssh user@192.168.68.1
```

## 开启wifi热点 (不依赖网桥的方法)

- Debian 使用NetworkManager进行网络连接管理，这里使用nmtui进行设置。
- 该方法不能同时使用rndis与wifi热点，如需要同时使用可以参考[rndis与wifi热点共存(debian)](https://www.kancloud.cn/handsomehacker/openstick/2684880)

```
$ sudo nmtui
```

之后的界面如下所示  
![](https://img.kancloud.cn/f7/1c/f71c2e8b1ebb7f0a70ad2eed1c783338_396x357.png)  
创建一个连接  
![](https://img.kancloud.cn/9d/c8/9dc82e36a4ffc8f8b9d945532cc62289_414x331.png)  
![](https://img.kancloud.cn/80/e2/80e265f40326c53faeb4c21df99aecf6_114x183.png)  
创建wifi类型的连接  
![](https://img.kancloud.cn/74/2d/742dfe8879ef372ba5eba28028055b89_642x479.png)  
device输入wlan0，其他选项按照你的需求自行填写  
![](https://img.kancloud.cn/10/af/10af206aa098ae79dc063652db054482_566x346.png)  
设置ip地址,注意ip类型必须为shared，ip地址必须为192.168.68.1  
![](https://img.kancloud.cn/6f/86/6f865d3d974c09091664fd1db84995db_567x206.png)

输入以下指令激活这个连接，激活后usb rndis功能会失效。

```
$ sudo nmcli con up test
```

要再次使用usb rndis，可以down掉这个连接

```
$ sudo nmcli con down test
```

## 常见问题

### UFI001C/SP970/UZ801 刷入debian.zip后工作不正常

debian.zip仅适用于ufi001b，若需要支持其他版型需要同时更新设备树与固件。  
在github的release中下载boot-<机型>.img与firmware-<机型>.zip两个文件后，解压firmware.zip后,插入OpenStick，在你的电脑上键入以下指令。（uz801仅需更新boot.img)

- 注：windows下的替换建议配合scp使用，windows下adb不支持通配符“ * ”

```
# 假设cmd&terminal的当前目录在firmware的解压文件夹下
$ adb push ./* /lib/firmware
$ adb reboot bootloader
$ fastboot flash boot boot-<机型>.img
$ fastboot reboot
```

### 初次开机执行apt时报错

```
 E: Release file for http://mirrors.163.com/debian/dists/bullseye/InRelease is not valid yet (invalid for another 157d 16h 4
9min 2s). Updates for this repository will not be applied.
E: Release file for http://security.debian.org/dists/bullseye-security/InRelease is not valid yet (invalid for another 209d
 4h 12min 32s). Updates for this repository will not be applied.
E: Release file for http://repo.mobian-project.org/dists/bullseye/InRelease is not valid yet (invalid for another 23d 19h 5
3min 31s). Updates for this repository will not be applied.
```

这是ntp服务没有及时同步时间所导致的，重启即可。

### adb环境下用不了nmtui等带图形的应用

例如执行nmtui时出现以下错误

```
root@openstick:/# nmtui     
TERM environment variable needs set.
```

设置TERM环境变量即可

```
$ export TERM=linux
```

### root用户使用ssh登录不了

- 感谢酷友@fanxueke的投稿。
- 不要尝试在你有内网穿透或是在公网有ip的设备上使用root登录，这将会造成很大的安全隐患。
- root的默认密码与user一致（都是1），可以通过`passwd root`修改

#### 1.安装nano编辑器（需插入SIM卡或连接wifi）

`sudo apt-get update`  
`sudo apt-get install nano`

#### 2.编辑sshd_config

`sudo nano /etc/ssh/sshd_config`

将34行`#PermitRootLogin prohibit-password`改为`PermitRootLogin yes`  
将58行`#PasswordAuthentication yes`的`#`去掉

#### 3.重启OpenStick

`sudo reboot`