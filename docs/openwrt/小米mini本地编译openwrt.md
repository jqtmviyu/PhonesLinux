# openwrt自编译

支持usb共享转发网络的定制版: x-wrt https://downloads.x-wrt.com/rom/
led灯大仓库: https://github.com/coolsnowwolf/lede
中国优化版: https://github.com/immortalwrt/immortalwrt

## opkg常见命令

```sh
opkg update
opkg install xxx
opkg remove xx --autoremove
opkg files xxx # 安装包关联文件
opkg list
opkg list-installed | grep kmod-fs-cifs
# 查看可升级软件包  
opkg list-upgradable

opkg install --force-overwrite
```

通过ssh更新源和安装更快不会卡住, 更新后刷新下页面, luci的软件列表就更新了

* 一键升级

```sh
# 更新软件列表
opkg update

# 更新所有 LUCI 插件
opkg list-upgradable | grep luci- | cut -f 1 -d ' ' | xargs opkg upgrade

# 如果要更新所有软件，包括 OpenWRT 内核、固件等
opkg list-upgradable | cut -f 1 -d ' ' | xargs opkg upgrade
```

* 导出安装列表

```sh
opkg list-installed > installed_packages.txt
```

## 安装旧版插件

### 支持直接安装

先找到插件的历史记录

```sh
wget url
opkg install  ./xxx
# 或者直接从网络安装
opkg install url
```

### 内核不支持

* 修改校验值

```sh
# 查看当前内核
cat /usr/lib/opkg/status
# 例如 5.15.90-1-61503095338197ff9fc92dc567a6085a

# 修改ipk包里面的值
# 先用7zip提取
# control.tar.gz
# 修改control 里的depend
# 重新压缩, 压缩格式为 tar.gz, 再改后缀


# 或者替换 /usr/lib/opkg/status文件内的所有内核值
sed 's/要替换的内容/替换后的内容/g' 文件名
# 例如
sed 's/6.1.61-1-61c61db898caea283d143e3454b7967c/6.1.61-1-cd97eb0fec3c5f43aca5893a34fb7c0c/g' /usr/lib/opkg/status
```

* 强制安装, 忽略依赖, 部分情况可以用

```sh
# 不安装依赖
opkg install xx --nodeps
# 无视缺失的依赖
opkg install xxx --force-depends
```

* 降级

```
opkg install xxx --force-downgrade
```

* 检查签名错误

```sh
# 注销掉 option check_signature
```

## 更改/添加软件源

```sh
/etc/opkg.conf
/etc/opkg/customfeeds.conf # 自定义仓库, 升级后还在
/etc/opkg/distfeeds.conf
```

文件不能为空, 至少保留一个#号

举例: 型号为 小米mini

```sh
# 官方
src/gz x-wrt_core https://downloads.openwrt.org/snapshots/targets/ramips/mt7620/packages
src/gz x-wrt_base https://downloads.openwrt.org/snapshots/packages/mipsel_24kc/base
src/gz x-wrt_luci https://downloads.openwrt.org/snapshots/packages/mipsel_24kc/luci
src/gz x-wrt_packages https://downloads.openwrt.org/snapshots/packages/mipsel_24kc/packages
src/gz x-wrt_routing https://downloads.openwrt.org/snapshots/packages/mipsel_24kc/routing
src/gz x-wrt_telephony https://downloads.openwrt.org/snapshots/packages/mipsel_24kc/telephony
```

```sh
# 国内镜像源
src/gz openwrt_core http://mirrors.cloud.tencent.com/lede/snapshots/targets/ramips/mt7620/packages
src/gz openwrt_base http://mirrors.cloud.tencent.com/lede/snapshots/packages/mipsel_24kc/base
src/gz openwrt_luci http://mirrors.cloud.tencent.com/lede/snapshots/packages/mipsel_24kc/luci
src/gz openwrt_packages http://mirrors.cloud.tencent.com/lede/snapshots/packages/mipsel_24kc/packages
src/gz openwrt_routing http://mirrors.cloud.tencent.com/lede/snapshots/packages/mipsel_24kc/routing
src/gz openwrt_telephony http://mirrors.cloud.tencent.com/lede/snapshots/packages/mipsel_24kc/telephony
```

```sh
# 第三方
src/gz immortalwrt_core https://downloads.immortalwrt.org/snapshots/targets/ramips/mt7620/packages
src/gz immortalwrt_base https://downloads.immortalwrt.org/snapshots/packages/mipsel_24kc/base
src/gz immortalwrt_luci https://downloads.immortalwrt.org/snapshots/packages/mipsel_24kc/luci
src/gz immortalwrt_packages https://downloads.immortalwrt.org/snapshots/packages/mipsel_24kc/packages
src/gz immortalwrt_routing https://downloads.immortalwrt.org/snapshots/packages/mipsel_24kc/routing
src/gz immortalwrt_telephony https://downloads.immortalwrt.org/snapshots/packages/mipsel_24kc/telephony
```

```sh
# 历史版本
# http://mirrors.ustc.edu.cn/openwrt/releases/
src/gz openwrt_core http://mirrors.ustc.edu.cn/openwrt/releases/22.03.5/targets/ramips/mt7620/packages
src/gz openwrt_base http://mirrors.ustc.edu.cn/openwrt/releases/22.03.5/packages/mipsel_24kc/base
src/gz openwrt_luci http://mirrors.ustc.edu.cn/openwrt/releases/22.03.5/packages/mipsel_24kc/luci
src/gz openwrt_packages http://mirrors.ustc.edu.cn/openwrt/releases/22.03.5/packages/mipsel_24kc/packages
src/gz openwrt_routing http://mirrors.ustc.edu.cn/openwrt/releases/22.03.5/packages/mipsel_24kc/routing
src/gz openwrt_telephony http://mirrors.ustc.edu.cn/openwrt/releases/22.03.5/packages/mipsel_24kc/telephony
```

软件源的下载路径`/var/opkg-lists/`

7621设备例如`友华wr330/wr1200js`, 把`7620`改为`7621`

## 只有ssh怎么上传下载文件

通过`scp`

```sh
# 上传
scp ./pandorabox.bin root@192.168.31.1:/tmp
# 下载
scp root@192.168.31.1:/tmp/pandorabox.bin ./
# 文件夹 -r
```

## 自编译

参考教程:

[OpenWrt官方（OpenWrt23.05）SDK编译PassWall教程](https://github.com/xiaorouji/openwrt-passwall/discussions/1603#top)

https://blog.x-wrt.com/docs/build/

https://github.com/coolsnowwolf/lede

https://jmdonj.com/编译openwrt.html

https://github.com/zszszszsz/.config?tab=readme-ov-file

为什么需要自编译:

官方提供的自动编译版本不够稳定, 历史版本稳定但内核太旧, 装不了新的插件

自己本地编译很浪费时间, 用在线编译更方便

https://openwrt.ai  在线编译网站, 但不能选内核, 有推广

github action 编译, 研究中, 缺点是每次都是重新开始, 没有缓存

### 本地编译x-wrt

这里以 小米wifi-mini 为例, 型号是r1c, 芯片是7620, 内存128m, 闪存(硬盘)16m

目的是以某个稳定的版本重新编译, 去掉自带不需要的功能, 添加自己需要的插件

#### 如何找到型号

https://downloads.x-wrt.com/rom/, 搜索`mini`, 看到固件名是`x-wrt-23.10-b202310280123-ramips-mt7620-xiaomi_miwifi-mini-squashfs-sysupgrade.bin`

* 23.10-b202310280123 是git的tag, 23.10是上游openwrt的版本号, 后面的2023是日期
* ramips 是架构, mt7620是芯片, 和上面core软件源一致(目标系统选MediaTek Ralink MIPS)
* squashfs 是只读文件系统,适合小容量的设备, 支持恢复出厂

#### 设备

* 设备是x86版macos, 在`OrbStack`中安装ubuntu虚拟机
* 注意事项:
	* 不要用root用户
	* 最好用`ubuntu`, 因为openwrt官方也是用它
	* 内存必须给够, 少了会失败, 我给了16G
	* 路径不能有中文和空格
	* 在linux文件系统中编译, 不要在macos映射的硬盘上
	* 全程必须科学, 注意下载插件仓库时有没有失败的, 失败的设置好网络后重新下载

#### 安装环境

```sh
sudo apt install build-essential ecj fastjar file flex g++ gcc-multilib g++-multilib gawk gettext git git-core java-propose-classpath libelf-dev libncurses5-dev libncursesw5-dev libssl-dev swig python3 python3-dev python3-distutils python3-pyelftools subversion unzip wget zlib1g-dev rsync qemu-utils
```

#### 克隆仓库

```sh
git clone https://github.com/x-wrt/x-wrt.git
cd x-wrt
git fetch origin --tags
git checkout <tag-name> # 我选择的是历史版本 22.10-b202301271130
```

#### 更新订阅

插件都是在另外仓库里的, 需要更新和下载到本地

```sh
# 这里拉取容易失败, 注意网络设置
# 获取在 feeds.conf / feeds.conf.default 中定义的所有最新软件包
./scripts/feeds update -a
# 将所有获得的软件包的符号链接安装到 package/feeds/中
./scripts/feeds install -a
# 如果找不到插件,就是网络问题, 没下载成功
```

#### 配置固件

先拷贝别人的模板, 再进行二次修改会更加容易

```sh
# 这里是拷贝的灯大的
cp feeds/x/rom/lede/config.ramips-mt7620-nosymbol .config
# 注意有个点
# nosymbol 内核分区限制小的设备
```

然后`make menuconfig`, 当然也可以不用模板, 自己从零开始直接`make menuconfig`

```sh
# Target Profile 选择需要编译打包的设备型号，选择型号后立刻退出，保存
# 修复 .config
sh feeds/x/rom/lede/fix-config.sh
# 作用似乎是把 PACKAGE_dnsmasq 注释掉, 改成not set
# 然后把其他 PACKAGE_dnsmasq开头的, 把 m 改成 y
make menuconfig # 然后立刻退出保存

# 最后一次
make menuconfig # 自定义选择你需要的软件包
```

#### 配置界面的快捷键

```sh
# 终端窗口不能太小, 太小容纳不下选项会异常
# 可以空格选择, 也可以 y
# 按键有y, m, n, 空格
# <*> 是编译到固件, <M> 是编译成ipk插件不编译到固件 < >是不编译
# 可以按 / 进行搜索, 如果要搜包名, 直接在前面加上 PACKAGE_
# 例如 PACKAGE_luci-app-aria2
# 注意看是不是带y, m , n 
# 还有是不是被其它依赖自动选三, 看下selected, selected by
```

==假设你选中了一个插件, 它有很多依赖项, 如果你不把这个插件去掉, 那些依赖项都改不了==
==但是你把这个插件取消了, 依赖项不会自动取消==
==所以请经常备份, 依赖项多的取消, 不如重新从模板添加==

```sh
# 对比默认配置的差异部分生成配置文件（可以理解为增量）
./scripts/diffconfig.sh > seed.config

# 若在调整 OpenWrt 系统组件的过程有多次保存操作，建议先删除 .config.old 文件再继续操作
rm -f .config.old

# 根据编译环境自动调整编译配置文件
make defconfig
```

#### 功能定制

包名直接用vscode 打开 config文件搜索, =y就是开启的

##### 新增

`davfs2` 挂载webdav
`luci-app-aria2` 下载
`n2n`

##### 删除

`qos` 流量服务质量 (QoS) 流控
`sqm` 流量智能队列管理
`openvpn`
`natcap` 远程管理功能
`wireguard`
`p910nd`打印机
`fakemesh` 假Mesh设置
`dawn` 实际不生效的拓扑图功能
`luci-app-wizard` 设置向导
`macvlan` 多播相关
`luci-app-macvlan`
`luci-app-xwan`
`kmod-macvlan`
`mwan3`
`luci-app-mwan3`
`xwan`
`luci-app-xwan`

##### 默认config没有的功能

有些功能是x-wrt官方加上的, 很好用, 但默认config没有, 需要添加回来

* exfat硬盘挂载, 对应的菜单是 系统-挂载点, 包括自动挂载(https://www.haiyun.me/archives/openwrt-usb-mount-disk.html)
	* `block-mount` 挂载, base默认选中, 不用添加
	* `blockd` 自动挂载
	* `kmod-exfat-linux` exfat支持, 也可以选择 `kmod-fs-exfat`
	* 因为移动硬盘是在widows下能可能用到, 所以选择了exfat
    * ntfs在linux下需要`ntfs-3g`才能读写, 且性能较差
    * 没用到ext4, 也就不装内核支持了
	* 可能还需要  `mount-utils  kmod-usb-storage kmod-usb-storage-extras kmod-usb-storage-uas  kmod-usb-ohci`
* smb共享, 对应的菜单是 服务-网络共享
	* `luci-app-ksmbd`
* 用户查看, 对应的菜单是 系统-用户
	* `luci-app-natflow-users
* 软件转发, 因为删掉 `natcapd`, 需要另外添加
	* `natflow-boot`
* 手机通过usb共享网络给路由, 配置config时, 在菜单 Kernel modules - USB Support
	* `kmod-mii`
	* `kmod-usb-net`
	* `kmod-usb-net-cdc-ether` 支持cdc以太网连接
	* `kmod-usb-net-rndis`
	* `kmod-usb2` 或者`kmod-usb3`

* 官方x-wrt还添加这些usb驱动, 但我没加上
	`kmod-usb-net-kalmia` 基于三星Kalmia的LTE USB调制解调器
	`kmod-usb-net-cdc-mbim` mbim
	`kmod-usb-net-cdc-ncm` 支持CDC NCM连接
	`kmod-usb-net-huawei-cdc-ncm`
	`kmod-usb-net-ipheth` iPhone USB以太网驱动程序
	`kmod-usb-net-qmi-wwan`  QMI WWAN driver
	`kmod-usb-net-rtl8152 `USB 转以太网 Realtek 8152
	`kmod-usb-net-sierrawireless` 意法半导体无线设备
* `luci-app-upnp`
* `luci-theme-argon`
* `iperf3`
* `curl`
* `unzip`
* luci --> modules --> Translations ---> luci-i18n-chinese

##### 常见的功能

```sh
luci-app-aria2 ARRIA2下载工具
luci-app-ddns DDNS工具
luci-app-mwan3 MWAN3负载均衡
luci-app-openvpn OPENVPN
luci-app-ksmbd Ksmbd文件网络共享（samba文件共享）
luci-app-upnp UPNP设置
luci-app-wireguard wireguard配置界面
luci-app-natcap 远程界面管理模块和全锥形nat实现模块
luci-app-natflow-users 用户认证（用户流量显示）模块
```

```
进入Kernel modules - USB Support菜单，选择USB支持的驱动
kmod-usb-acm kmod-usb-serial 是usb转串口
kmod-usb-hid 键盘鼠标支持
```

```
进入Kernel modules - Filesystems菜单，选择需要支持的文件系统，比如ext4,ntfs,vfat等
```

```sh
进入Kernel modules - Wireless Drivers菜单，选择无线支持的驱动，如果需要挂卡的驱动，也是在这里找
```

```sh
## 插件类
LuCI ---> Applications ---> luci-app-accesscontrol #上网时间控制
LuCI ---> Applications ---> luci-app-adbyby-plus   #去广告
LuCI ---> Applications ---> luci-app-arpbind  #IP/MAC绑定
LuCI ---> Applications ---> luci-app-autoreboot  #高级重启
LuCI ---> Applications ---> luci-app-aliddns   #阿里DDNS客户端
LuCI ---> Applications ---> luci-app-ddns   #动态域名 DNS
LuCI ---> Applications ---> luci-app-filetransfer  #文件传输
LuCI ---> Applications ---> luci-app-firewall   #添加防火墙
LuCI ---> Applications ---> luci-app-frpc   #内网穿透 Frp
LuCI ---> Applications ---> luci-app-mwan3   #MWAN负载均衡
LuCI ---> Applications ---> luci-app-nlbwmon   #网络带宽监视器
LuCI ---> Applications ---> luci-app-ramfree  #释放内存
LuCI ---> Applications ---> luci-app-samba   #网络共享(Samba)
LuCI ---> Applications ---> luci-app-sqm  #流量智能队列管理(QOS)
LuCI ---> Applications ---> luci-app-openclash #你懂的那只猫
LuCI ---> Applications ---> luci-app-dnsfilter #广告过滤
LuCI ---> Applications ---> luci-app-passwall #不敢解释
LuCI ---> Applications ---> luci-app-mtwifi #闭源Wi-Fi驱动
LuCI ---> Applications ---> luci-app-eqos #根据IP控制网速
LuCI ---> Applications ---> luci-app-syncdial #薛定谔的多拨应用
LuCI ---> Applications ---> luci-app-zerotier #虚拟局域网
LuCI ---> Applications ---> luci-app-oaf #应用过滤神器
LuCI ---> Applications ---> luci-app-watchcat #断网检测功能与定时重启
LuCI ---> Applications ---> luci-app-wol   #WOL网络唤醒
LuCI ---> Applications ---> luci-app-wrtbwmon  #实时流量监测
LuCI ---> Applications ---> luci-app-upnp   #通用即插即用UPnP(端口自动转发)
LuCI ---> Applications ---> luci-app-argon-config #Argon主题设置

# 常用主题类
LuCI ---> Themes ---> luci-theme-argon

# 网络相关 (普通用户用不上）
Network ---> IP Addresses and Names ---> ddns-scripts_cloudflare.com-v4
Network ---> IP Addresses and Names --->  bind-dig
Network ---> Routing and Rediction ---> ip-full
Network ---> File Transfer ---> curl
Network ---> File Transfer ---> wget-ssl
Network ---> iperf3
Network ---> ipset
Network ---> socat #多功能的网络工具
Base system --> dnsmasq-full #DNS缓存和DHCP服务（dnsmasq-full和dnsmasq二者不可共存）

# 工具类 (普通用户用不上）
Utilities --> acpid  #电源管理接口（适用于x86平台）
Utilities --> Editors --> nano #Nano 编辑器
Utilities --> Shells --> bash #命令解释程序
Utilities --> disc --> eject #弹出可移动介质
Utilities --> disc --> fdisk #MBR分区工具
Utilities --> disc --> gdisk #GBT分区工具
Utilities --> disc --> lsblk #列出磁盘设备及分区查看工具
Utilities --> Filesystem --> resize2fs #调整文件系统大小
Utilities --> Filesystem --> e2fsprogs #Ext2（及Ext3/4）文件系统工具

# IPv6（未来运营商可能不再提供 IPv4 公网地址，有远程访问需求的建议加入）
Extra packages ---> ipv6helper （勾选此项即可，下面几项自动勾选）
Network ---> odhcp6c
Network ---> odhcpd-ipv6only
LuCI ---> Protocols ---> luci-proto-ipv6
LuCI ---> Protocols ---> luci-proto-ppp
```

##### 修改配置

```sh
# 后台地址, 搜192.168
package/base-files/files/bin/config_generate

# 修改活动连接数
sed -i 's/16384/65535/g' package/kernel/linux/files/sysctl-nf-conntrack.conf

# 查看内核第三位
immortalwrt/include/kernel-6.1
# 修改内核版本
# /target/linux/ 架构 /Makefile
# 假设默认的内核版本为 5.15。
KERNEL_PATCHVER:=5.15
# 具体支持内核版本：
include/kernel-version.mk
# 或者设置下面的选项。
Global build settings ────Use the testing kernel version

# openwrt 修改默认语言为 zh_cn
feeds/luci/modules/luci-base/root/etc/config/luci
# option lang auto 修改为 option lang zh_cn

# 修改主机名, system.@system[-1].hostname='123'
package/base-files/files/bin/config_generate

# 修改无线名称 SSID
package/kernel/mac80211/files/lib/wifi/mac80211.sh
# set wireless.default_radio${devidx}.ssid=2333

# 修改标准时间
package/base-files/files/bin
# 在 set system.@system[-1].timezone= 的下面添加 set system.@system[-1].zonename='Asia/Shanghai'

# 修改时区为 CST-8
package/base-files/files/bin
# 把 set system.@system[-1].timezone='UTC' 修改为 set system.@system[-1].timezone='CST-8'

# 修改固件 Root 密码
package/base-files/files/etc/shadow
# 把密码添加到root：和：中间即可。
```

#### 添加第三方插件

* 添加到订阅里

```sh
# 订阅源
vim feeds.conf.default
###
src-git Openclash https://github.com/vernesong/OpenClash
src-git 2n2 https://github.com/ntop/n2n
###
# 更新和下载
./scripts/feeds update -a && ./scripts/feeds install -a
```

* 直接添加到`package`下

n2n: https://github.com/ntop/n2n/tree/dev/packages/openwrt

```sh
git clone https://github.com/ntop/n2n n2n
N2N_PKG_VERSION=$(n2n/scripts/version.sh)
export N2N_PKG_VERSION
echo $N2N_PKG_VERSION

cp -r n2n/packages/openwrt openwrt/package/n2n

cd openwrt
make oldconfig
# In the VPN section, select "m" for n2n-edge and n2n-supernode
# 客户端只需要n2n-edge

make package/n2n/clean V=s
make package/n2n/prepare USE_SOURCE_DIR=$(realpath ../n2n) V=s
make package/n2n/compile V=s # 这里如果直接编译会报错, 好像是依赖`kmod-gpio-button-hotplug`
# 先执行前两步, 最后一步不管, 整体编译会加进去
```

用 `/etc/init.d/edge start` 启动。它的配置文件是 `/etc/n2n/edge.conf`

* 怎么找软件

第三方软件仓库 或看原作者没有有提供

https://github.com/immortalwrt/packages
https://github.com/immortalwrt/luci
https://github.com/coolsnowwolf/lede

直接下载文件夹 https://download-directory.github.io/

假设在 immortalwrt/luci 下载了n2n的luci application, 放到 feeds/luci/applications/luci-app-n2n
还要到 package/feeds/luci 下创建软链接

* luci 插件中文表

https://github.com/coolsnowwolf/lede/issues/2415

#### 进行编译

```sh
make

# 也可以先下载dl库
make download V=s
# 检查dl库, 按经验来说 1k 以下的文件，大概率没有下载完
find dl -size -1024c
find dl -type f -size -1024c -delete
# 再编译
make -j5 V=s
# 如果出错了, 换成单线程再跑一遍, 方便定位错误, 其实第一次最好j1
# j是指定线程, V=s是输出详细信息, 方便定位错误
# 线程越多, 占用内存越多
# 自动跑满线程
make -j$(nproc) V=s

# 输出目录 /bin, 固件在targets, 插件在packages
# 用find 命令搜插件更快
find . -name "*n2n*.ipk"

# initramfs-kernel 是放在内存的, 适合移植到没有闪存的设备
```

#### 遇到的报错

* 构建依赖性：OpenWrt只能在区分大小写的文件系统上构建

```sh
Build dependency: OpenWrt can only be built on a case-sensitive filesystem
```

```sh
# 修改 include/prereq-build.mk

# 注释掉
# $(eval $(call TestHostCommand,case-sensitive-fs, \
# 	OpenWrt can only be built on a case-sensitive filesystem, \
# 	rm -f $(TMP_DIR)/test.*; touch $(TMP_DIR)/test.fs; \
# 		test ! -f $(TMP_DIR)/test.FS))
```

#### 二次编译

```sh
git pull
# 更新FEEDS
./scripts/feeds update -a && ./scripts/feeds install -a

make download -j8
make -j4 V=s
```

如果需要改动 config

```sh
# 删除config缓存, 不删可能新插件不加载出来
rm -rf ./tmp

# 不一定需要删除, 如果改动比较小
# 因为依赖不会自动取消的原因, 改动大, 新建
rm -rf .config
rm -rf .config.old

make menuconfig
```

需要删除旧文件

```sh
# 删除 /bin 和 /build_dir 目录中的文件
make clean
# 更换架构或源码有重大更新
# 清理 /bin 和 /build_dir 目录的中的文件以及 /staging_dir、/toolchain、/tmp 和 /logs（清除旧的编译产物、交叉编译工具及工具链等目录）
make dirclean
# 清除 OpenWrt 源码
make distclean
```

#### 单独编译ipk

需要先完整编译一遍,或者使用cdk

1. 下载源码
2. `make menuconfig`, 选中M
3. `make package/luci-theme-rosy/luci-theme-rosy/compile V=99` 替换/compile前面部分
4. 完成后搜索 `find . -name "luci-theme-rosy*.ipk"`
5. 需要清理编译 `make package/luci-theme-rosy/luci-theme-rosy clean`

#### 生成个性化配置文件

```sh
# 把当前的配置文件和默认配置文件做对比, 生成差异文件
./scripts/diffconfig.sh > my_diffconfig.config

# 应用差异性文件
./scripts/config/confdiff my_diffconfig.config
```

### clang 加速(没成功)

配置OpenWRT环境：在OpenWRT源代码目录下，运行以下命令以配置编译环境，并选择使用Clang编译器：

```sh
sudo apt-get install clang
make menuconfig
# 在配置菜单中，按照以下步骤进行设置：
# 进入 "Advanced configuration options (for developers)"（高级开发者选项）。没有这个选项
# 选择 "Toolchain Options"（工具链选项）。
# 在 "Select the C library implementation"（选择C库实现）中，选择 "musl"。
# 在 "Build the OpenWrt toolchain with Clang"（使用Clang构建OpenWrt工具链）中，选择 "y"（是）。
# 保存并退出配置菜单。
```

### github action 自动编译

待补充...

### menuconfig界面详解

```
没说明的就默认。一般是用不上的，或者是可以顾名思义的。
    Target System：按照软路由的 cpu，选择 CPU 架构。
    Subtarget：按照软路由的 cpu，选择具体的 CPU 型号。
    Target Profile：选择具体的路由器型号。
    Target Images：对生成镜像的压缩格式、文件系统格式和镜像空间的设置，选择几个则编译完成之后就有几个格式的固件。
    ramdisk：顾名思义，就是将内存虚拟成硬盘，内存充裕的话可以打开，有效提升性能，默认不选。 Compression 是压缩等级(none 表示不压缩)。
    cpio.gz 和 tar.gz：镜像生成之后打包成压缩包的格式，压缩之后体积减少很多，方便分享。看需求勾选。
    ext4 和 squashfs：ext4 适用于大容量闪存,易于修改分区大小,没有恢复出厂设置的功能。squashfs 适用于小容量闪存，不可修改分区大小，有恢复出厂设置的功能。一般是选择只读文件系统（squashfs）。想了解更多的内容，自行搜索。
    Build GRUB images 和 Build GRUB EFI images：顾名思义，传统启动还是 efi 启动。
    Title for the menu entry in GRUB：进入后台看到的由很多字符组成 openwrt。可以自定义你想要的字符。（大概）
    Build LiveCD image (ISO)
    Build PVE/KVM image files (QCOW2)
    Build VirtualBox image files (VDI)
    Build VMware image files (VMDK)
    Build Hyper-V image files (VHDX)
    GZip images
    上面几个是编译出的镜像格式，前面 5 个是虚拟机使用的，选择几个，最后编译出来几个，按需选择。
    Kernel partition size (in MB)：内核分区大小 (单位MB)，也就是系统分区，驱动或插件多的话需要适当扩大这个分区。
    Root filesystem partition size (in MB)：，根文件系统分区大小 (单位 MB)，文件系统分区，基本可以理解为安装后默认的 /overlay 分区大小。12 和 13 组成了固件的体积
    Root partition on target device：根文件系统所在分区位置。默认值为 /dev/sda2，没有特殊需求，默认就好不用动。
    Make /var persistent：持久化 /var，开启后重启软路由 /var 下内容会保留。 没说明的就默认。一般人用不上，或者是可以顾名思义的。
    Global build settings：全局构建设置。 这里的选项默认就好，基本不用动。
    Advanced configuration options (for developers) ：和我们没啥关系。
    Build the OpenWrt Image Builder ：和我们没啥关系。
    Build the OpenWrt SDK ：和我们没啥关系。
    Package the OpenWrt-based Toolchain ：和我们没啥关系。
    Image configuration：和我们没啥关系。
    Base system：设置基础系统 默认选项就足够用了，除非有特殊需求。
    需要 ipv6 要选择 dnsmasq-full 的 build with dhcpv6 support
    选择默认的 dnsmasq-full 即可,另外 2 个 dnsmasq 切记不要选。（我也不知道为什么）
    zram-swap：压缩内存，把部分数据压缩以节省内存，拿时间换空间，对软路由怎么说都有 1G 内存，肯定足够的。默认不选择。
    Administration：管理
    htop：进程浏览器。
    netdata：实时监控。
    netatop：网络连接计数。 其他的选项我保持默认。
    Boot Loaders：启动加载器，默认就好
    Development：开发：默认就好
    Extra packages：扩展软件包，提供 ipv6 支持，usb 自动挂载等，按需选择。
    ipv6helper：ipv6的相关组件。
    autosamba：samba 文件共享，只支持 samba3,选择 samba4 时不勾选。
    autocore：多核 NAT，自动省电降频，自动睿频和超线程这些应该在这里面，可以去掉。 其他的默认就好， k3wifi 应该是 k3 的无线驱动。
    Firmware：相关硬件的驱动，有 amd cpu 的微码，amd 显卡驱动，网卡的驱动。按需选择。
    Fonts：里面是字体，随意选择或者不选都行。
    Kernel modules：内核模块，按需选择，很多选项是软路由才会用到的。
    Block Devices：块设备支持，默认也行。
    CAN Support：CAN 支持，默认就好。
    Cryptographic API modules：默认就好。
    Filesystems：文件系统支持，按需选择，或者默认。
    FireWire support：火线支持，默认就好。
    Hardware Monitoring Support：硬件监控模块，默认就好。
    I2C support：i2c 支持，默认就好。
    Industrial I/O Modules：工业 I/O 模块，应该是工控机需要的，默认不勾选。
    Input modules：输入模块，如果没有特殊需要，默认就好
    LED modules：led 模块，我的软路由没这玩意，默认不选。
    Libraries：库，默认就好
    Native Language Support：语言编码支持，加上cp936（简体中文）就好。
    Netfilter Extensions：netfilter 扩展，不懂的话，默认就好了。
    Network Devices：有线网卡支持，按需选择。
    Network Support：网络支持，按需选择，不懂就默认，默认的足够一般人使用。
    Other modules：其他模块，不懂就默认，默认的足够一般人使用。
    PCMCIA support：PCMCIA 支持，默认就好。
    SPI Support：SPI支持，默认就好，很少看到设备有spi。
    Sound Support：音频支持，默认不选，谁的路由器还带个音响。
    USB Support：USB 设备支持，按需选择。
    Video Support：视频支持，按需选择，我不需要 gpu 渲染画面，就不勾选。
    Virtualization：虚拟化，kvm 虚拟机可能会用到，我用 esxi，所以不勾选。
    Voice over IP：不了解这东西，默认不选。
    W1 support：不了解这东西，默认不选。
    WPAN 802.15.4 Support：WPAN 802.15.4 支持，一般用不上，默认不勾选。
    Wireless Drivers：无线网卡驱动，按需选择。 没说明的都是很少用的，有需要自己查资料吧。
    Languages：这里应该是开启某些编程语言的支持，一般用不上，默认不选。
    Libraries：库，默认就好，里面东西多
    Luci： Collections：有docker和nginx，ssl，按需选择。luci #添加luci (web界面管理)
    Modules：不懂就默认。Translations ---> Simplified Chinese (zh-cn) #新版本中文包
    Applications：我们需要的软件就在这里了，按需安装。
    Themes：主题。
    Protocols：默认就好。
    Libraries：默认就好。
    Translations ---> luci-i18n-chinese #添加 luci 的中文语言包
    Mail：一般用不上，默认不勾选。
    Multimedia：和多媒体有关的软件包，按需选择。
    Network：网络有关的软件包，按需选择。
    Sound：音频有关软件包，默认不勾选，
    Utilities：实用程序，按需选择。
        Virtualization
        qemu-ga
    Utilities  --->  open-vm-tools  #适用于 VMware 的 VM Tools
    Utilities  --->  open-vm-tools-fuse  #适用于 VMware 的 VM Tools
    Utilities  --->  Compression ---><*>unrar（解压缩工具）
    Utilities  --->  Compression ---><*> unzip（解压缩工具）
    Utilities  --->  Compression ---><*> zip（解压缩工具）
    Utilities  --->  Filesystem ---><*> badblocks（支持 ext2 文件系統）
    Utilities  --->  Filesystem ---><*> e2fsprogs（支持 ext2/ext3/ext4 格式化工具）
    Utilities  --->  disc ---><*> blkid（可以列出分区类型卷标等）
    Utilities  --->  disc ---><*> fdisk（分区工具）
    Utilities  --->  disc ---><*> lsblk（列出块设备，还能显示它们之间的依赖关系）
    Utilities  ---><*> bzip2（解压缩工具）
    Utilities  ---><*> lrzsz（上传下载工具）
    Utilities  ---><*> restorefactory（reset 键支持(长按 5 秒以上就可以恢复固件默认设置)）
    Utilities  ---><*> wifitoggle（添加一键开关无线(按一下 WPS 键放开，无线就打开或者关闭)）
    Xorg：默认就好
```
