# mido设备移植Ubuntu20.04

## 一、初始化环境

### 1.安装编译依赖环境

```bash
#这里宿主机使用Ubuntu20.04系统
sudo apt install binfmt-support qemu-user-static gcc-10-aarch64-linux-gnu kernel-package fakeroot simg2img img2simg mkbootimg bison flex gcc-aarch64-linux-gnu pkg-config libncurses-dev libssl-dev unzip git debootstrap
```

### 2.下载最新内核源码

```bash
mkdir workspaces && cd workspaces
git clone https://github.com/msm8953-mainline/linux.git --depth 1
```

（可选）设置git代理使用科学的网络：

```bash
cat > gitproxy.sh << EOF
#!/bin/bash
case \$1 in
on)
git config --global http.proxy 'http://192.168.2.64:7897' 
git config --global https.proxy 'http://192.168.2.64:7897'
;;
off)
git config --global --unset http.proxy
git config --global --unset https.proxy
;;
status)
git config --get http.proxy
git config --get https.proxy
;;
esac
EOF
chmod +x gitproxy.sh
```

### 3.下载内核编译.config文件

参考大佬仓库的.config文件<https://gitee.com/meiziyang2023/ubuntu-ports-xiaomi-625-phones>
或者pmos的config-postmarketos-qcom-msm8953.aarch64文件<https://gitlab.com/postmarketOS/pmaports/-/tree/master/device/community/linux-postmarketos-qcom-msm8953>

```bash
cd cd ~/workspaces/linux
wget https://gitee.com/meiziyang2023/ubuntu-ports-xiaomi-625-phones/raw/master/.config
```

## 二、编译内核和内核deb安装包

### 1.设置编译环境变量

```bash
cd ~/workspaces
cat > env.sh << EOF
export CROSS_COMPILE=aarch64-linux-gnu-
export ARCH=arm64
export CC=aarch64-linux-gnu-gcc
EOF
chmod +x env.sh
```

### 2.开始编译内核

```bash
source ./env.sh
cd ./linux
make clean
rm -r ./debian
make menuconfig
make -j$(nproc)
```

### 3.编译内核deb安装包

```bash
fakeroot make-kpkg  --initrd --cross-compile aarch64-linux-gnu- --arch arm64 kernel_image kernel_headers -j$(nproc)
#编译完成，内核安装包生成在源码上级目录
```

## 三、制作rootfs.img镜像

### 1.创建空白rootfs.img镜像文件

```bash
cd ~/workspaces
dd if=/dev/zero of=rootfs-focal.img bs=1G count=2
mkfs.ext4 rootfs-focal.img
```

### 2.使用debootstrap

```bash
mkdir ~/chroot
sudo mount rootfs-focal.img ~/chroot
sudo debootstrap --arch arm64 focal ~/chroot https://mirrors.aliyun.com/ubuntu-ports
#sudo debootstrap --arch arm64 --variant=minbase --include=vim,ca-certificates,apt-utils,locales focal ~/chroot https://mirrors.aliyun.com/ubuntu-ports
```

### 3.chroot进入rootfs安装喜欢的包,初始化一些配置

```bash
sudo mount --bind /proc ~/chroot/proc
sudo mount --bind /dev ~/chroot/dev
sudo mount --bind /dev/pts ~/chroot/dev/pts
sudo mount --bind /sys ~/chroot/sys

sudo chroot ~/chroot
#以下命令即都是在chroot环境中
#修改阿里源
cat > /etc/apt/sources.list << EOF
deb https://mirrors.aliyun.com/ubuntu-ports/ focal main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu-ports/ focal main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu-ports/ focal-security main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu-ports/ focal-security main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu-ports/ focal-updates main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu-ports/ focal-updates main restricted universe multiverse

# deb https://mirrors.aliyun.com/ubuntu-ports/ focal-proposed main restricted universe multiverse
# deb-src https://mirrors.aliyun.com/ubuntu-ports/ focal-proposed main restricted universe multiverse

deb https://mirrors.aliyun.com/ubuntu-ports/ focal-backports main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu-ports/ focal-backports main restricted universe multiverse
EOF
#更新源
apt update && apt upgrade
#设置locales
locale-gen en_US.UTF-8
locale-gen zh_CN.UTF-8
#设置中国时区
rm /etc/localtime
ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
#设置hostname
echo 'xiaomi-mido' > /etc/hostname
#卸载netplan
apt purge netplan.io
#创建用户
useradd -m -s /bin/bash hol
usermod -aG sudo hol
#设置密码
passwd hol
#安装一些包
apt install man man-db bash-completion vim tmux network-manager chrony openssh-server initramfs-tools --no-install-recommends -y
```

### 4.安装编译的内核

在**宿主机中执行**拷贝内核安装包到rootfs中

```bash
cp ~/workspaces/linux*.deb ~/chroot/tmp
```

在**chroot环境**中执行安装内核，安装之前确保**chroot环境**中已经安装了**initramfs-tools**

```bash
cd /tmp
dpkg --get-selections | grep linux
dpkg -l | grep -E "linux-headers|linux-image" |awk '{print $2}'|xargs dpkg -P
rm -rf /lib/modules/*

dpkg -i linux*.deb
dpkg --get-selections | grep linux

ls /lib/modules
```

### 5.拷贝firmware文件

在**宿主机中执行**拷贝firmware到rootfs中

```bash
cp -r ./firmware/* ~/chroot/usr/lib/firmware/
ldconfig
```

在**chroot环境**中执行

### 6.制作boot.img

在**宿主机中执行**

```bash
mkdir ~/workspaces/tmp_mkboot
rm -rf ~/workspaces/tmp_mkboot/*
cp ~/workspaces/linux/arch/arm64/boot/dts/qcom/*mido*.dtb ~/workspaces/tmp_mkboot/
cp ~/workspaces/linux/arch/arm64/boot/Image.gz ~/workspaces/tmp_mkboot/
cp ~/chroot/boot/initrd* ~/workspaces/tmp_mkboot/

cp ~/workspaces/tmp_mkboot/initrd* ~/workspaces/tmp_mkboot/initrd.img
cp ~/workspaces/tmp_mkboot/msm*.dtb ~/workspaces/tmp_mkboot/dtb
cat ~/workspaces/tmp_mkboot/Image.gz ~/workspaces/tmp_mkboot/dtb > ~/workspaces/tmp_mkboot/kernel-dtb
mkbootimg --base 0x80000000 \
        --kernel_offset 0x00008000 \
        --ramdisk_offset 0x01000000 \
        --tags_offset 0x00000100 \
        --pagesize 2048 \
        --second_offset 0x00f00000 \
        --ramdisk ~/workspaces/tmp_mkboot/initrd.img \
        --cmdline "console=tty0 root=UUID=20336aa9-c9de-431a-b679-dcf10065c121 rw loglevel=3 splash"\
        --kernel ~/workspaces/tmp_mkboot/kernel-dtb -o ~/workspaces/tmp_mkboot/boot.img

#这里的UUID需要替换成自己的rootfs.img的uuid，通过file查看,格式化后的rootfs.img的uuid不会变。
file ~/workspaces/rootfs-focal.img
#其他偏移量可以在pmos网站的deviceinfo上找到
```

### 7.一些优化

自动扩展文件系统

```bash
cat > /etc/systemd/system/resizefs.service << 'EOF'
[Unit]
Description=Expand root filesystem to fill partition
After=local-fs.target

[Service]
Type=oneshot
ExecStart=/usr/bin/bash -c 'exec /usr/sbin/resize2fs $(findmnt -nvo SOURCE /)'
ExecStartPost=/usr/bin/systemctl disable resizefs.service
RemainAfterExit=true

[Install]
WantedBy=default.target
EOF
systemctl enable resizefs.service
```

开启串口登录

```bash
cat > /etc/systemd/system/serial-getty@ttyGS0.service << EOF
[Unit]
Description=Serial Console Service on ttyGS0

[Service]
ExecStart=-/usr/sbin/agetty -L 115200 ttyGS0 xterm+256color
Type=idle
Restart=always
RestartSec=0

[Install]
WantedBy=multi-user.target
EOF
systemctl enable serial-getty@ttyGS0.service
#如果串口登录失效，可能是g_serial模块没有加载
echo g_serial >> /etc/modules
```

### 8.清理chroot环境，并退出

在**chroot环境**中执行

```bash
apt clean
rm -f /tmp/*
history -c
Ctrl + D
```

### 9.卸载rootfs镜像挂载，转换成刷机镜像

在**宿主机中执行**

```bash
sudo umount ~/chroot/proc
sudo umount ~/chroot/dev/pts
sudo umount ~/chroot/dev
sudo umount ~/chroot/sys
sudo umount ~/chroot
img2simg ~/workspaces/rootfs-focal.img ~/workspaces/tmp_mkboot/rootfs.img
```

这样在~/workspaces/tmp_mkboot目录中就得到了可以刷机的rootfs.img和boot.img了。可以愉快的去刷机了:)

感谢pmos项目，感谢umeko大佬的教程<https://github.com/umeiko/KlipperPhonesLinux/>
