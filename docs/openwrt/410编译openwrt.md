# 410-openwrt

## 编译410 openwrt

环境, openwrt 的环境先装一遍

`android-sdk-libsparse-utils` `mkbootimg` `cmake`, 然后报缺什么装什么, 包名问下openai

想修改镜像, 镜像不能挂载:生成的是simg格式, 需要用工具转化 `img2simg` `simg2img`

### HandsomeMod

python报错, 说要大于3.5, 实际为3.11

```
vim include/prereq-build.mk
改动 162行和171行
```

主题报错

```
/usr/lib/lua/luci/template.lua:97: Failed to execute template 'sysauth'.
A runtime error occurred: /usr/lib/lua/luci/template.lua:97: Failed to execute template 'header'.
A runtime error occurred: /usr/lib/lua/luci/template.lua:97: Failed to execute template 'themes/argon/header'.
A runtime error occurred: [string "/usr/lib/lua/luci/view/themes/argon/header...."]:20: attempt to call field 'node_childs' (a nil value)

# 到原主题仓库更新主题
```

cdc_ether.ko missing

```
kmod-usb-net-cdc-ncm 不装
```

### immortalwrt

下载: lkiuyu/immortalwrt

选择平台并增加体积

```
Target System (Boards based on Snapdragon 218/410/615 chipsets)
Subtarget (Snapdragon 410 (msm8916) based boards)
Target Profile (YiMing OpenStick UZ801)
Target Images -> ext4
			  -> Root filesystem partition size -> 500
```

自动添加中文语言包

`luci -> default-settings-chn`

添加的包

```sh
package_android-tools-adbd
package_curl
package_unzip

package_ipv6helper

# 挂载smb
package_kmod-fs-cifs
package_cifsmount

package_kmod-usb-net-rndis # 网络共享

# 不想装
# package_kmod-usb-gadget-serial
# package_kmod-usb-net-cdc-ncm
# package_kmod-usb-net-rtl8152
# package_kmod-usb-serial
# package_kmod-usb-serial-ch341
# package_kmod-usb-serial-cp210x
# package_kmod-usb-serial-ftdi
# package_kmod-usb-serial-option
# package_kmod-usb-serial-pl2303
# package_kmod-usb-serial-wwan
# package_kmod-usb-storage
# package_kmod-usb-storage-extras
# package_kmod-usb2

# led
package_kmod-leds-gpio
package_kmod-ledtrig-gpio
# package_kmod-ledtrig-heartbeat # 频率与1分钟平均CPU负载成正比
# package_kmod-nft-netdev # 已配置接口上的链路状态和/或发送和接收活动
# package_kmod-usb-ledtrig-usbport # LED trigger for USB ports
# package_kmod-ledtrig-timer # 自定义模拟呼吸
# package_rssileds # RSSI信号强度
# https://openwrt.org/docs/guide-user/base-system/led_configuration
```

```sh
package_luci # 不装你没后台页面
# package_luci-app-diskman # 不想装
package_luci-app-dockerman
package_luci-app-cpufreq
package_luci-app-fileassistant
package_luci-proto-modemmanager
package_luci-app-mmconfig # 没找到
package_luci-app-ttyd
package_luci-app-webadmin
package_luci-mod-admin-full
package_luci-theme-argon
```

不需要的, 被light主题依赖, 没找到去掉的方法

```sh
kmod-ppp
kmod-pppoe
kmod-pppox
luci-proto-ppp
```

记录旧分支的一个bug: `openstick-tweak`这个包会不自动勾选, 要自己勾选(涉及到adb rndis 磁盘自动扩容以及自动配置modemmanager)

刷完重启后会再自动重启一次, 红灯长亮正常现象

### 修改led灯

```sh
# 设备树

# 修复led设置里没有网络触发的问题
/target/linux/msm89xx/dts/

config-6.1
===
CONFIG_LEDS_TRIGGER_NETDEV=y
===

# 把红灯长亮改成蓝灯
dts/msm8916-ufi.dtsi
msm8916-yiming-uz801v3.dts
===
# 把红灯的function去了
linux,default-trigger = "heartbeat";
===
```

### 第三方软件源

https://mirrors.vsean.net/openwrt/snapshots/targets/armsr/armv8/

```
src/gz immortalwrt_core https://mirrors.vsean.net/openwrt/snapshots/targets/armsr/armv8/packages/
src/gz immortalwrt_base https://mirrors.vsean.net/openwrt/snapshots/packages/aarch64_generic/base
src/gz immortalwrt_luci https://mirrors.vsean.net/openwrt/snapshots/packages/aarch64_generic/luci
src/gz immortalwrt_packages https://mirrors.vsean.net/openwrt/snapshots/packages/aarch64_generic/packages
src/gz immortalwrt_routing https://mirrors.vsean.net/openwrt/snapshots/packages/aarch64_generic/routing
src/gz immortalwrt_telephony https://mirrors.vsean.net/openwrt/snapshots/packages/aarch64_generic/telephony
```

```
src/gz handsomemod_core https://downloads.immortalwrt.org/snapshots/targets/armsr/armv8/packages
src/gz handsomemod_base https://downloads.immortalwrt.org/snapshots/packages/aarch64_cortex-a53/base
src/gz handsomemod_luci https://downloads.immortalwrt.org/snapshots/packages/aarch64_cortex-a53/luci
src/gz handsomemod_packages https://downloads.immortalwrt.org/snapshots/packages/aarch64_cortex-a53/packages
src/gz handsomemod_routing https://downloads.immortalwrt.org/snapshots/packages/aarch64_cortex-a53/routing
src/gz handsomemod_telephony https://downloads.immortalwrt.org/snapshots/packages/aarch64_cortex-a53/telephony
```

### 挂载smb

`mount.cifs //192.168.2.1/h1 /mnt/h1 -o guest,iocharset=utf8,file_mode=0644,dir_mode=0777`

如果要开放多个接口

```sh
修改Ksmbd的模板
原来是interfaces =  |INTERFACES| 只支持单选
手动改成多个
interfaces = usb0 br-lan
```

### 超频

参考: https://yanhy.top/?p=382#nei_he_chao_pin

debian是找到 `linux/drivers/clk/qcom 找到 a53-pll.c`

openwrt 找不到对应路径, `find . -name 'a53-pll.c'` 有两个中间产物在build路径下, 修改之

```sh
static const struct pll_freq_tbl a53pll_freq[] = {
	{  998400000, 52, 0x0, 0x1, 0 },
	{ 1094400000, 57, 0x0, 0x1, 0 },
	{ 1152000000, 62, 0x0, 0x1, 0 },
	{ 1209600000, 63, 0x0, 0x1, 0 },
	{ 1248000000, 65, 0x0, 0x1, 0 },
	{ 1363200000, 71, 0x0, 0x1, 0 },
	{ 1401600000, 73, 0x0, 0x1, 0 },
	{ 1621600000, 84, 0x0, 0x1, 0 },
	{ 1841600000, 96, 0x0, 0x1, 0 },
	{ 1951600000, 103, 0x0, 0x1, 0 },
	{ }
};
```

`msm8916.dtsi` 同样用find找到修改

```sh
opp-1363200000 {
	opp-hz = /bits/ 64 <1363200000>;
};
opp-1401600000 {
	opp-hz = /bits/ 64 <1401600000>;
};
opp-1621600000 {
	opp-hz = /bits/ 64 <1621600000>;
};
opp-1841600000 {
	opp-hz = /bits/ 64 <1841600000>;
};
opp-1951600000 {
	opp-hz = /bits/ 64 <1951600000>;
};
```

重新编译

```sh
# 查看
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq
```

### 40mhz补丁

https://github.com/torvalds/linux/commit/960ae77f25631bbe4e3aafefe209b52e044baf31

https://imgse.com/i/qJUlzF 图包, 另存为zip解压

```
drivers/net/wireless/ath/wcn36xx/main.c
```

搜索`wcn36xx.ko`替换成作者编译后的

```
hostapd.conf
ht_capab=[HT40-][SHORT-GI-20][SHORT-GI-40]
```

debian 设置 hostapd `/etc/hostapd/hostapd.conf`
https://zhuanlan.zhihu.com/p/660888011

如果是 nmtui , /etc/NetworkManager/system-connections/

```
[wifi]
band=bg
channel-width=40
```

### 释放内存

```
自行调整设备树关掉modem和视频编解码器（venus）的保留内存
```

用16进制编辑器编辑boot.img, 把设备树分配的地址改为零
例如mpss,搜到mpss关键词, 把55对应的0550改为0000

![](https://img.hellohxx.top/202311230235576.jpeg)

![](https://img.hellohxx.top/202311230236329.png)

## 切换host模式

切换usb host和usb slave

```sh
# 切换成usb主机模式（otg模式）
echo host > /sys/kernel/debug/usb/ci_hdrc.0/role
# 切换为默认的从机模式（接电脑的usb网络共享和adb）
echo gadget > /sys/kernel/debug/usb/ci_hdrc.0/role
```

## 切卡

```sh
echo 0 > /sys/class/leds/sim\:sel/brightness
echo 255 > /sys/class/leds/sim\:sel2/brightness
/etc/init.d/rmtfs restart
/etc/init.d/modemmanager restart
```