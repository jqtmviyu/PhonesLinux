# mido pmos编译

## 直接编译

```sh
git clone --depth=1 https://git.sr.ht/~postmarketos/pmbootstrap
mkdir -p ~/.local/bin
ln -s "$PWD/pmbootstrap/pmbootstrap.py" ~/.local/bin/pmbootstrap
vim ~/.zshrc # bash换成.bashrc
===
PATH="$HOME/.local/bin:$PATH"
===
source ~/.zshrc
pmbootstrap --version

pmbootstrap init
pmbootstrap pull
# 不需要特殊定制
pmbootstrap install
# pmbootstrap install --filesystem btrfs # 指定分区格式

# xiaomi-mido.img
~/.local/var/pmbootstrap/chroot_native/home/pmos/rootfs

# config boot.img lk2nd.img
~/.local/var/pmbootstrap/chroot_rootfs_xiaomi-mido/boot

# 监控Í日志
pmbootstrap log
```

## 修改内核选项

https://www.twblogs.net/a/601638e4e64365bb610bbf47/?lang=zh-cn

https://ivonblog.com/posts/xperia5-ii-postmarketos-porting/

```sh
# cd ~/.local/var/pmbootstrap/cache_git/pmaports/device
# find . -name  '*mido*'
# ~/.local/var/pmbootstrap/cache_git/pmaports/device/community/device-xiaomi-mido
# 查看APKBUILD: linux-postmarketos-qcom-msm8953 lk2nd-msm8953 mkbootimg postmarketos-base soc-qcom-msm8953

# find . -name  '*8953*'
# ./community/linux-postmarketos-qcom-msm8953/config-postmarketos-qcom-msm8953.aarch64

# 代理要开tun模式, proxy下不动
pmbootstrap kconfig edit --arch=aarch64 linux-postmarketos-qcom-msm8953
# smb挂载 需要cifs 和 utf8
pmbootstrap build linux-postmarketos-qcom-msm8953 --force --arch=aarch64

# 生成路径
# ~/.local/var/pmbootstrap/packages/edge/aarch64/
```

## pom登录后的设置

```sh
sudo -i//提权操作
passwd root //设置root账户密码，但是此时root远程连接默认关闭
nmtui   //链接wifi，如果链接不成功，手机在安卓系统升级到第三方高版本，再重新刷入
setup-ntp #回车直接使用 chrony 同步时间
date #查看时间同步成功再使用apk update，因为使用的是ustc https的镜像站，时间不对更新不了，安装不了

# 开启root用户登录
echo -e "PermitRootLogin yes\nPasswordAuthentication yes" >> /etc/ssh/sshd_config&&service sshd restart

# 关闭防火墙
sudo service nftables stop
sudo rc-update del nftables

# 安装Docker
apk update
apk upgrade
apk add docker
addgroup user docker
rc-update add docker boot
service docker start
docker info
echo -e 'sleep 10&&sudo dockerd --iptables=false &>/dev/null &' >> /etc/rc.conf
```

## 新版pmos rndis用不了

https://postmarketos.org/edge/2023/10/29/rndis-ncm/

ncm改回rndis

```sh
vim /etc/deviceinfo
===
deviceinfo_usb_network_function="rndis.usb0"
===
sudo mkinitfs
```