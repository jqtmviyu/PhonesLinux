# mido

参考链接:

Pmbootstrap 相关:
https://wiki.postmarketos.org/wiki/Xiaomi_Redmi_Note_4_(xiaomi-mido)
https://wiki.postmarketos.org/wiki/Installation
https://wiki.postmarketos.org/wiki/Pmbootstrap

博客:
https://blog.csdn.net/github_38345754/article/details/114291930
https://forum.renegade-project.tech/t/835-845-855-uefi-archlinux/2497
https://forum.renegade-project.tech/t/835-845-855-uefi-ubuntu-rootfs/2891
https://www.knightli.com/2023/08/09/随身wif-idebian-固件编译/

视频:
https://www.bilibili.com/video/BV15N4y127mN/
https://www.bilibili.com/video/BV13G411Y7u4/

名词解释:
https://wiki.postmarketos.org/wiki/Glossary

## 源码下载

1. mainline

https://github.com/msm8953-mainline/linux

注意下载打包后的, 而不是main仓库

2. 相关脚本

https://gitee.com/meiziyang2023/hm2-ubuntu-ports

3. 内核编译配置文件

https://gitlab.com/postmarketOS/pmaports/-/blob/master/device/community/linux-postmarketos-qcom-msm8953/config-postmarketos-qcom-msm8953.aarch64?ref_type=heads

4. 开源驱动

https://gitlab.com/postmarketOS/pmaports/-/blob/master/device/community/firmware-xiaomi-mido/APKBUILD?ref_type=heads
找到这个下载地址
https://github.com/Kiciuk/proprietary_firmware_mido

## 依赖安装

```sh
sudo apt-get install cpio
sudo apt install avrdude gcc-avr binutils-avr avr-libc stm32flash libnewlib-arm-none-eabi gcc-arm-none-eabi binutils-arm-none-eabi pkg-config
sudo apt install binfmt-support qemu-user-static gcc-10-aarch64-linux-gnu kernel-package fakeroot simg2img img2simg mkbootimg bison
```

## 编译

### 内核编译配置

下载 `config-postmarketos-qcom-msm8953.aarch64`, 用`check-kernel-config.sh`脚本进行处理

```sh
mv config-postmarketos-qcom-msm8953.aarch64 config
./check-kernel-config.sh config -w

# 复制到linux文件夹中
cp config linux/.config

# 设置环境变量
source ./env.sh
echo $ARCH
```

```sh
# check-kernel-config.sh
#!/bin/bash

FILE=$1

[ -f "$FILE" ] || {
	echo "Provide a config file as argument"
	exit
}

write=false

if [ "$2" = "-w" ]; then
	write=true
fi

CONFIGS_ON="
CONFIG_IKCONFIG
CONFIG_CPUSETS
CONFIG_AUTOFS4_FS
CONFIG_TMPFS_XATTR
CONFIG_TMPFS_POSIX_ACL
CONFIG_CGROUP_DEVICE
CONFIG_CGROUP_MEM_RES_CTLR
CONFIG_CGROUP_MEM_RES_CTLR_SWAP
CONFIG_CGROUP_MEM_RES_CTLR_KMEM
CONFIG_RTC_DRV_CMOS
CONFIG_BLK_CGROUP
CONFIG_CGROUP_PERF
CONFIG_IKCONFIG_PROC
CONFIG_SYSVIPC
CONFIG_CGROUPS
CONFIG_CGROUP_FREEZER
CONFIG_NAMESPACES
CONFIG_UTS_NS
CONFIG_IPC_NS
CONFIG_USER_NS
CONFIG_PID_NS
CONFIG_NET_NS
CONFIG_AUDIT
CONFIG_AUDITSYSCALL
CONFIG_AUDIT_TREE
CONFIG_AUDIT_WATCH
CONFIG_CC_STACKPROTECTOR
CONFIG_DEBUG_RODATA
CONFIG_DEVTMPFS
CONFIG_DEVTMPFS_MOUNT
CONFIG_DEVPTS_MULTIPLE_INSTANCES
CONFIG_ECRYPT_FS
CONFIG_ECRYPT_FS_MESSAGING
CONFIG_ENCRYPTED_KEYS
CONFIG_EXT4_FS_POSIX_ACL
CONFIG_EXT4_FS_SECURITY
CONFIG_FSNOTIFY
CONFIG_DNOTIFY
CONFIG_INOTIFY_USER
CONFIG_FANOTIFY
CONFIG_FANOTIFY_ACCESS_PERMISSIONS
CONFIG_KEYS
CONFIG_SWAP
CONFIG_VT
CONFIG_VT_CONSOLE
CONFIG_SECCOMP
CONFIG_STRICT_DEVMEM
CONFIG_SYN_COOKIES
CONFIG_BT
CONFIG_BT_RFCOMM
CONFIG_BT_RFCOMM_TTY
CONFIG_BT_BNEP
CONFIG_BT_BNEP_MC_FILTER
CONFIG_BT_BNEP_PROTO_FILTER
CONFIG_BT_HIDP
CONFIG_XFRM_USER
CONFIG_NET_KEY
CONFIG_INET
CONFIG_IP_ADVANCED_ROUTER
CONFIG_IP_MULTIPLE_TABLES
CONFIG_INET_AH
CONFIG_INET_ESP
CONFIG_INET_IPCOMP
CONFIG_INET_XFRM_MODE_TRANSPORT
CONFIG_INET_XFRM_MODE_TUNNEL
CONFIG_INET_XFRM_MODE_BEET
CONFIG_IPV6
CONFIG_INET6_AH
CONFIG_INET6_ESP
CONFIG_INET6_IPCOMP
CONFIG_INET6_XFRM_MODE_TRANSPORT
CONFIG_INET6_XFRM_MODE_TUNNEL
CONFIG_INET6_XFRM_MODE_BEET
CONFIG_IPV6_MULTIPLE_TABLES
CONFIG_NETFILTER
CONFIG_NETFILTER_ADVANCED
CONFIG_NETFILTER_NETLINK
CONFIG_NETFILTER_NETLINK_ACCT
CONFIG_NETFILTER_NETLINK_LOG
CONFIG_NETFILTER_NETLINK_QUEUE
CONFIG_NETFILTER_TPROXY
CONFIG_NETFILTER_XTABLES
CONFIG_NETFILTER_XT_CONNMARK
CONFIG_NETFILTER_XT_MARK
CONFIG_NETFILTER_XT_MATCH_ADDRTYPE
CONFIG_NETFILTER_XT_MATCH_CLUSTER
CONFIG_NETFILTER_XT_MATCH_COMMENT
CONFIG_NETFILTER_XT_MATCH_CONNBYTES
CONFIG_NETFILTER_XT_MATCH_CONNLIMIT
CONFIG_NETFILTER_XT_MATCH_CONNMARK
CONFIG_NETFILTER_XT_MATCH_CONNTRACK
CONFIG_NETFILTER_XT_MATCH_CPU
CONFIG_NETFILTER_XT_MATCH_DCCP
CONFIG_NETFILTER_XT_MATCH_DEVGROUP
CONFIG_NETFILTER_XT_MATCH_DSCP
CONFIG_NETFILTER_XT_MATCH_ECN
CONFIG_NETFILTER_XT_MATCH_ESP
CONFIG_NETFILTER_XT_MATCH_HASHLIMIT
CONFIG_NETFILTER_XT_MATCH_HELPER
CONFIG_NETFILTER_XT_MATCH_HL
CONFIG_NETFILTER_XT_MATCH_IPRANGE
CONFIG_NETFILTER_XT_MATCH_LENGTH
CONFIG_NETFILTER_XT_MATCH_LIMIT
CONFIG_NETFILTER_XT_MATCH_MAC
CONFIG_NETFILTER_XT_MATCH_MARK
CONFIG_NETFILTER_XT_MATCH_MULTIPORT
CONFIG_NETFILTER_XT_MATCH_NFACCT
CONFIG_NETFILTER_XT_MATCH_OSF
CONFIG_NETFILTER_XT_MATCH_OWNER
CONFIG_NETFILTER_XT_MATCH_PKTTYPE
CONFIG_NETFILTER_XT_MATCH_POLICY
CONFIG_NETFILTER_XT_MATCH_QUOTA
CONFIG_NETFILTER_XT_MATCH_QUOTA2
CONFIG_NETFILTER_XT_MATCH_RATEEST
CONFIG_NETFILTER_XT_MATCH_REALM
CONFIG_NETFILTER_XT_MATCH_RECENT
CONFIG_NETFILTER_XT_MATCH_SCTP
CONFIG_NETFILTER_XT_MATCH_SOCKET
CONFIG_NETFILTER_XT_MATCH_STATE
CONFIG_NETFILTER_XT_MATCH_STATISTIC
CONFIG_NETFILTER_XT_MATCH_STRING
CONFIG_NETFILTER_XT_MATCH_TCPMSS
CONFIG_NETFILTER_XT_MATCH_TIME
CONFIG_NETFILTER_XT_MATCH_U32
CONFIG_NETFILTER_XT_TARGET_AUDIT
CONFIG_NETFILTER_XT_TARGET_CHECKSUM
CONFIG_NETFILTER_XT_TARGET_CLASSIFY
CONFIG_NETFILTER_XT_TARGET_CONNMARK
CONFIG_NETFILTER_XT_TARGET_CONNSECMARK
CONFIG_NETFILTER_XT_TARGET_CT
CONFIG_NETFILTER_XT_TARGET_DSCP
CONFIG_NETFILTER_XT_TARGET_HL
CONFIG_NETFILTER_XT_TARGET_IDLETIMER
CONFIG_NETFILTER_XT_TARGET_LED
CONFIG_NETFILTER_XT_TARGET_LOG
CONFIG_NETFILTER_XT_TARGET_MARK
CONFIG_NETFILTER_XT_TARGET_NFLOG
CONFIG_NETFILTER_XT_TARGET_NFQUEUE
CONFIG_NETFILTER_XT_TARGET_NOTRACK
CONFIG_NETFILTER_XT_TARGET_RATEEST
CONFIG_NETFILTER_XT_TARGET_SECMARK
CONFIG_NETFILTER_XT_TARGET_TCPMSS
CONFIG_NETFILTER_XT_TARGET_TCPOPTSTRIP
CONFIG_NETFILTER_XT_TARGET_TEE
CONFIG_NETFILTER_XT_TARGET_TPROXY
CONFIG_NETFILTER_XT_TARGET_TRACE
CONFIG_NF_CONNTRACK_ZONES
CONFIG_IP6_NF_FILTER
CONFIG_IP6_NF_IPTABLES
CONFIG_IP6_NF_MANGLE
CONFIG_IP6_NF_MATCH_AH
CONFIG_IP6_NF_MATCH_EUI64
CONFIG_IP6_NF_MATCH_FRAG
CONFIG_IP6_NF_MATCH_HL
CONFIG_IP6_NF_MATCH_IPV6HEADER
CONFIG_IP6_NF_MATCH_MH
CONFIG_IP6_NF_MATCH_OPTS
CONFIG_IP6_NF_MATCH_RPFILTER
CONFIG_IP6_NF_MATCH_RT
CONFIG_IP6_NF_QUEUE
CONFIG_IP6_NF_RAW
CONFIG_IP6_NF_SECURITY
CONFIG_IP6_NF_TARGET_HL
CONFIG_IP6_NF_TARGET_REJECT
CONFIG_IP6_NF_TARGET_REJECT_SKERR
CONFIG_DNS_RESOLVER
CONFIG_IOSCHED_DEADLINE
CONFIG_SUSPEND_TIME
CONFIG_CORE_DUMP_DEFAULT_ELF_HEADERS
CONFIG_CONSOLE_TRANSLATIONS
CONFIG_EVM
CONFIG_INTEGRITY_SIGNATURE
CONFIG_FHANDLE
CONFIG_EPOLL
CONFIG_SIGNALFD
CONFIG_TIMERFD
CONFIG_TMPFS_POSIX_ACL
"

CONFIGS_OFF="
"
CONFIGS_EQ="
"

ered() {
	echo -e "\033[31m" $@
}

egreen() {
	echo -e "\033[32m" $@
}

ewhite() {
	echo -e "\033[37m" $@
}

echo -e "\n\nChecking config file for Halium specific config options.\n\n"

errors=0
fixes=0

for c in $CONFIGS_ON $CONFIGS_OFF;do
	cnt=`grep -w -c $c $FILE`
	if [ $cnt -gt 1 ];then
		ered "$c appears more than once in the config file, fix this"
		errors=$((errors+1))
	fi

	if [ $cnt -eq 0 ];then
		if $write ; then
			ewhite "Creating $c"
			echo "# $c is not set" >> "$FILE"
			fixes=$((fixes+1))
		else
			ered "$c is neither enabled nor disabled in the config file"
			errors=$((errors+1))
		fi
	fi
done

for c in $CONFIGS_ON;do
	if grep "$c=y\|$c=m" "$FILE" >/dev/null;then
		egreen "$c is already set"
	else
		if $write ; then
			ewhite "Setting $c"
			sed  -i "s,# $c is not set,$c=y," "$FILE"
			fixes=$((fixes+1))
		else
			ered "$c is not set, set it"
			errors=$((errors+1))
		fi
	fi
done

for c in $CONFIGS_EQ;do
	lhs=$(awk -F= '{ print $1 }' <(echo $c))
	rhs=$(awk -F= '{ print $2 }' <(echo $c))
	if grep "^$c" "$FILE" >/dev/null;then
		egreen "$c is already set correctly."
		continue
	elif grep "^$lhs" "$FILE" >/dev/null;then
		cur=$(awk -F= '{ print $2 }' <(grep "$lhs" "$FILE"))
		ered "$lhs is set, but to $cur not $rhs."
		if $write ; then
			egreen "Setting $c correctly"
			sed -i 's,^'"$lhs"'.*,# '"$lhs"' was '"$cur"'\n'"$c"',' "$FILE"
			fixes=$((fixes+1))
		fi
	else
		if $write ; then
			ewhite "Setting $c"
			echo  "$c" >> "$FILE"
			fixes=$((fixes+1))
		else
			ered "$c is not set"
			errors=$((errors+1))
		fi
	fi
done

for c in $CONFIGS_OFF;do
	if grep "$c=y\|$c=m" "$FILE" >/dev/null;then
		if $write ; then
			ewhite "Unsetting $c"
			sed  -i "s,$c=.*,# $c is not set," $FILE
			fixes=$((fixes+1))
		else
			ered "$c is set, unset it"
			errors=$((errors+1))
		fi
	else
		egreen "$c is already unset"
	fi
done

if [ $errors -eq 0 ];then
	egreen "\n\nConfig file checked, found no errors.\n\n"
else
	ered "\n\nConfig file checked, found $errors errors that I did not fix.\n\n"
fi

if [ $fixes -gt 0 ];then
	egreen "Made $fixes fixes.\n\n"
fi

ewhite " "
```

```sh
# env.sh
export CROSS_COMPILE=aarch64-linux-gnu-
export ARCH=arm64
export CC=aarch64-linux-gnu-gcc
```

### 开始编译

```sh
cd linux
# 添加内核组件, 如smb支持的cifs
make menuconfig

# debian 不支持内核模块压缩
Enable loadable module support --> Module compression mode (None) --〉

# 开始编译
# make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- -j$(nproc)
make -j$(nproc)

# 生成deb安装包

# ubuntu 20 可以使用的命令
# fakeroot make-kpkg  --initrd --cross-compile aarch64-linux-gnu- --arch arm64  kernel_image kernel_headers 
# make -j$(nproc) ARCH=arm64 KBUILD_DEBARCH=arm64 KDEB_CHANGELOG_DIST=mobile CROSS_COMPILE=aarch64-linux-gnu- deb-pkg

# Ubuntu 23 命令
make -j$(nproc) bindeb-pkg

# 在上级目录生成 heades image 的deb包
cd ../ & ls

# Image.gz msm8953-xiaomi-mido.dtb 复制待用
# cp linux/arch/arm64/boot/Image.gz tmp_mkboot/
# cp linux/arch/arm64/boot/dts/qcom/msm8953-xiaomi-mido.dtb tmp_mkboot/

```

## 制作rootfs

### 移植其它设备的rootfs

例如 高通410随身wifi的

```sh
# 把rootfs.img模板转ext4
simg2img root_temp.img root_temp.ext4
mkdir root_temp

# 挂载模板
sudo mount root_temp.ext4 root_temp

# 新建
mkdir ubuntu
dd if=/dev/zero of=root.img bs=1M count=1536
mkfs.ext4 root.img
sudo mount root.img ubuntu

# 复制
sudo cp -a root_temp/* ubuntu/
sudo umount root_temp

# 复制开源驱动
sudo chmod -R +x firmware
sudo chown -R root:root firmware
sudo cp -a firmware/* ubuntu/lib/firmware/

# chroot
./mount_rootfs.sh
```

```sh
# mount_rootfs.sh
sudo mount root.img ubuntu

sudo mount --bind /proc ubuntu/proc
sudo mount --bind /dev ubuntu/dev
sudo mount --bind /dev/pts ubuntu/dev/pts
sudo mount --bind /sys ubuntu/sys

sudo cp /etc/resolv.conf ubuntu/etc/
sudo cp /etc/hosts ubuntu/etc/

rm ubuntu/tmp/linux-*.deb 
cp *.deb ubuntu/tmp

sudo chroot ubuntu /usr/bin/bash
```

### 从零构建rootfs

#### debian

https://github.com/SdtElectronics/debian-rootfs

#### ubuntu(btrfs)

```sh
# https://cdimage.ubuntu.com/ubuntu-base/
wget https://cdimage.ubuntu.com/ubuntu-base/releases/22.04.3/release/ubuntu-base-22.04.3-base-arm64.tar.gz

dd if=/dev/zero of=root.img bs=1M count=1536
mkfs.btrfs root.img
sudo mount -t btrfs -o compress-force=zstd root.img ubuntu
cd ubuntu
sudo tar -xpvf ../ubuntu-base-22.04.3-base-arm64.tar.gz
cd ../
sudo cp /etc/resolv.conf ubuntu/etc/
sudo cp /etc/hosts ubuntu/etc/
sudo chroot ubuntu /usr/bin/sh

apt install ntp ca-certificates locales vim netplan.io  apt-utils dialog curl -y
```

##### fstab

```sh
blkid
# 输出可能类似于：
/dev/loop0: UUID="1cc002ea-d1c2-483c-99c0-cad31fa09674" UUID_SUB="8c83d75c-c8cf-42ff-aded-010461d38f91" BLOCK_SIZE="4096" TYPE="btrfs"
/dev/vdc2: UUID="d5abc362-7bc1-457e-b44e-915964fc8f95" TYPE="swap"
/dev/zram0: UUID="b401ef65-0437-4cf1-b96f-613f127179e8" TYPE="swap"

echo "# /etc/fstab: static file system information" > /etc/fstab
echo "# <file system> <mount point>   <type>  <options>       <dump>  <pass>" >> /etc/fstab
echo "UUID=4982f187-6831-40c4-9cc2-9a9258aefe91 /               btrfs   rw,relatime,compress-force=zstd:3        0       1" >> /etc/fstab
# echo "UUID=d5abc362-7bc1-457e-b44e-915964fc8f95 none            swap    sw              0       0" >> /etc/fstab
# echo "UUID=51bb7a4d-13c1-406e-ab3a-4dc0cc38ff13 none            swap    sw              0       0" >> /etc/fstab
```

##### ubuntu换源

```sh
vim /etc/apt/sources.list

# 镜像源
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy-updates main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy-backports main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy-backports main restricted universe multiverse

deb http://ports.ubuntu.com/ubuntu-ports/ jammy-security main restricted universe multiverse
# deb-src http://ports.ubuntu.com/ubuntu-ports/ jammy-security main restricted universe multiverse

# 预发布软件源，不建议启用
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy-proposed main restricted universe multiverse
# # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ jammy-proposed main restricted universe multiverse

apt update
```

##### 开机扩容

方法一: 开机后手动执行命令

```sh
btrfs filesystem resize max /
```

方法二: 添加自启服务

```sh
cat > /etc/systemd/system/resizefs.service << 'EOF'
[Unit]
Description=Expand root filesystem to fill partition
After=local-fs.target

[Service]
Type=oneshot
ExecStart=/usr/bin/bash -c 'btrfs filesystem resize max /'
ExecStartPost=/usr/bin/systemctl disable resizefs.service
RemainAfterExit=true

[Install]
WantedBy=default.target
EOF
systemctl enable resizefs.service
```

##### docker启动不了

ubuntu的问题, 降级iptable解决

```sh
update-alternatives --set iptables /usr/sbin/iptables-legacy
update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
```

#### arch

```sh
http://os.archlinuxarm.org/os/ArchLinuxARM-aarch64-latest.tar.gz
```

### 安装内核

```sh
# 删除自带内核
cd /tmp
dpkg --get-selections | grep linux
dpkg -l | grep -E "linux-headers|linux-image" |awk '{print $2}'|xargs dpkg -P
# 手动删除
dpkg -P 包名

# 自动生成initram
apt install initramfs-tools zstd

# 安装内核
dpkg -i *.deb
# 清理空间
rm *.deb

# 修改主机名
vim /etc/hostname
vim /etc/hosts

# debian换源
vim /etc/apt/sources.list

===
deb http://mirrors.ustc.edu.cn/debian stable main contrib non-free non-free-firmware
deb http://mirrors.ustc.edu.cn/debian stable-updates main contrib non-free non-free-firmware
deb http://mirrors.ustc.edu.cn/debian stable-proposed-updates main contrib non-free non-free-firmware
===

apt update

# 设置locales
apt install locales
# locale-gen
# vim /etc/locale.gen
# zh_CN.UTF-8 UTF-8
# en_US.UTF-8 UTF-8
# locale-gen

dpkg-reconfigure locales
update-locale LANG=en_US.UTF-8

# 更改密码
passwd

# 中文字体
apt install fonts-wqy-microhei

# ssh
apt install openssh-server
echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
systemctl enable ssh

# 时区
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# 时间同步
apt install ntp -y

# 常用软件
apt install sudo net-tools network-manager iputils-ping kmod linux-base -y

systemctl enable NetworkManager

# 自动创建内存一半的zram
apt install zram-tools

# 可选
# btrfs 相关工具
apt install btrfs-progs
# btrfs压缩率分析, compsize /path
apt install btrfs-compsize

# 清理
apt autoremove
apt clean
history -c

# 退出
exit
```

## 制作boot

### 复制boot所需的文件

```sh
# 需要rootfs里的 initrd.img 和 内核编译时生成的 Image.gz dtb
./get_kernel_files.sh

# 复制完就可以卸载rootfs了
./umount_rootfs.sh
```

```sh
# get_kernel_files.sh
mkdir ./tmp_mkboot
cp ./linux/arch/arm64/boot/dts/qcom/*mido*.dtb ./tmp_mkboot/dtb
cp ./linux/arch/arm64/boot/Image.gz ./tmp_mkboot/
cp ubuntu/boot/initrd* ./tmp_mkboot/initrd.img
```

```sh
# umount_rootfs.sh
sudo umount ubuntu/proc
sudo umount ubuntu/dev/pts
sudo umount ubuntu/dev
sudo umount ubuntu/sys
sudo umount ubuntu
```

### 生成boot和rootf安卓刷机包

```sh
# 需要 initrd.img Image.gz dtb
file root.img
# 修改 mkboot.sh 里的 UUID
./mkboot.sh
```

```sh
# mkboot.sh
rm ./tmp_mkboot/kernel-dtb
cat ./tmp_mkboot/Image.gz ./tmp_mkboot/dtb > ./tmp_mkboot/kernel-dtb
mkbootimg --base 0x80000000 \
        --kernel_offset 0x00008000 \
        --ramdisk_offset 0x01000000 \
        --tags_offset 0x00000100 \
        --pagesize 2048 \
        --second_offset 0x00f00000 \
        --ramdisk ./tmp_mkboot/initrd.img \
        --cmdline "console=tty0 root=UUID=239798af-b82a-4547-b4d4-448ab8335552 rw loglevel=3"\
        --kernel ./tmp_mkboot/kernel-dtb -o ./tmp_mkboot/boot.img
img2simg ./root.img ./tmp_mkboot/rootfs.img
```

## 刷机

1. 首先是小米官方解bl
2. 刷入 pmos 的 lk2nd
3. 重启, 手机震动后长按音量减, 进入 lk2nd 引导的 rec
4. 用fastboot 刷入 boot rootfs

```sh

fastboot erase userdata
fastboot erase boot
fastboot flash boot lk2nd.img
fastboot reboot

fastboot flash boot boot.img
fastboot flash userdata rootfs.img
fastboot reboot
```