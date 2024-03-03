# 410 debian 设置

## 设置虚拟内存

```sh
创建swap/zram虚拟内存
# 创建swap虚拟内存
dd if=/dev/zero of=/root/swapfile bs=1M count=512
mkswap /root/swapfile
swapon /root/swapfile
# 创建一个大小为512MB虚拟内存其命名为swapfile，保存在/root目录下。然后格式化为交换分区文件和启用交换分区文件。

# 创建zram虚拟内存
modprobe zram num_devices=1
zramctl --find --size 512M --algorithm lz4 --streams 4
mkswap /dev/zram1
swapon -p 0 /dev/zram1

• 加载zram内核模块，并指定设备数量为1。创建一个512MB大小的zram设备，并使用lz4算法进行压缩，同时将数据分成4个流。将zram设备格式化为swap分区，启用zram设备，并设置优先级。
• swapon -a：启用所有swap分区。
• swapoff -a：禁用所有swap分区。
• swapon --show或swapon -s：显示当前系统中已启用的swap分区。
• swapon -p 或swapon --priority：将指定的swap分区设置为指定的优先级。优先级越高的swap分区，系统越倾向于将内存数据转移到该分区中。
```

## 禁止mac随机地址

```sh
# [https://wiki.archlinuxcn.org/wiki/NetworkManager](https://wiki.archlinuxcn.org/wiki/NetworkManager)

# 禁用随机 MAC 地址

vim /etc/NetworkManager/NetworkManager.conf

[device]
wifi.scan-rand-mac-address=no

# 不知道有没用, 我又加了
[main]
no-auto-default=*

# 重新启动
systemctl restart NetworkManager
nmcli device wifi rescan
nmcli dev wifi list

# 
nmcli connection
nmcli connection delete id 'connection name'
nmcli connection delete uuid 'connection uuid'
nmcli dev wifi con 'name' password 'connection password '
```

## 安装常见软件包

```sh
# 更新和升级系统中已安装的软件包

apt-get update && apt-get upgrade && apt-get update --fix-missing
 
# apt-get update：更新可用软件包的列表。这个命令会检查软件源中是否有新的软件包或更新，并下载它们的信息，以便后续的安装和升级操作可以使用最新的软件包列表。
# apt-get upgrade：升级已安装的软件包。这个命令会根据最新的软件包列表，将已安装的软件包升级到最新版本。
# apt-get update --fix-missing：修复可能由于软件源列表信息不完整而导致的问题。如果在第一步中更新软件包列表时出现错误，这个命令可以尝试修复这些错误。

# 如果用的不是国内源建议更换为国内源，更换源脚本太长我就不提供了，搜索一下Debian怎么换源即可。如果用的是Zy143L大佬的抖音9.9 GT106 Debian固件的话要先执行一下apt-mark hold systemd && apt-mark hold libsystemd0将这俩自动更新关闭，不然会导致按键双击关机失效。

# 安装一些常用的软件包
apt-get install curl wget vim vim busybox iptables iproute2 cpufrequtils

# curl：用于在命令行中传输数据的工具。
# wget：用于下载文件的命令行工具。
# vim：一个简单易用的文本编辑器。
# vim：一个强大的文本编辑器，常用于程序开发和系统配置。
# busybox：一个适用于嵌入式系统和单片机的工具集，包含了大部分基本的Linux工具。
# iptables：用于配置Linux防火墙的工具。
# iproute2：用于管理网络连接和路由的工具。
# cpufrequtils：用于管理CPU频率的工具。
```

## cpu频率

```sh 
# 修改cpu频率
#先安装cpufrequtils工具

apt-get install cpufrequtils

# 设置cpu模式
cpufreq-set -g conservative
cpufreq-set -c 2 -g conservative
cpufreq-set -c 3 -g conservative
# 调整cpu频率上下限
cpufreq-set -d 200000
cpufreq-set -u 800000
cpufreq-set -c 3 -d 307MHz -u 1.59GHz
#查看CPU频率和调度信息
cpufreq-info -o
#查看cpu当前频率
cpufreq-info -c 0 -f -m
cpufreq-info -c 1 -f -m
cpufreq-info -c 2 -f -m
cpufreq-info -c 3 -f -m
#查看当前cpu支持模式
cpufreq-info -g

# powersave 是无论如何都只会保持最低频率的所谓“省电”模式；
# userspace 是自定义频率时的模式，这个是当你设定特定频率时自动转变的；
# ondemand 默认模式。一有cpu计算量的任务，就会立即达到最大频率运行，等执行完毕就立即回到最低频率；
# conservative 保守模式，会自动在频率上下限调整，和ondemand的区别在于它会按需分配频率，而不是一味追求最高频率；
# performance 顾名思义只注重效率，无论如何一直保持以最大频率运行。
# schedutil 可以动态地调整CPU的频率和电压来平衡性能和功耗，会根据负载情况动态调整。
```

## 清理垃圾

```sh
# 清理系统中不需要的软件包和日志文件

apt-get autoremove && apt-get clean && apt-get autoclean && journalctl --vacuum-size=5M

# apt-get autoremove：卸载已经不再需要的软件包。这个命令会移除已经安装但是没有被其他软件所依赖的软件包。
# apt-get clean：清理已经下载的软件包文件。这个命令会删除已经下载并安装的软件包的本地缓存文件，以释放磁盘空间。
# apt-get autoclean：清理过期的软件包。这个命令会删除已经过期的软件包，但是保留最新的软件包版本的本地缓存文件，以便以后重新安装。
# journalctl --vacuum-size=5M：缩减系统日志文件。这个命令会删除旧的系统日志文件，只保留最近的5M大小的日志文件。
```

## 闪存相关

```sh
# TRIM优化
fstrim -v /
# fstrim是一个用于在Linux系统中进行TRIM操作的命令行工具，可以用来清理SSD硬盘上的闲置块，提高SSD硬盘的性能和寿命。
# 查看寿命
cat /sys/class/mmc_host/mmc0/mmc0\:0001/life_time
```

## 关闭led

```sh
echo none > /sys/class/leds/red:os/trigger
echo none > /sys/class/leds/blue:wifi/trigger
echo none > /sys/class/leds/green:internet/trigger
```

## 添加开机启动项目

```sh
# 可将相应命令加入到rc.local文件开机自启
#  确保rc.local文件拥有可执行权限：sudo chmod +x /etc/rc.local
# 编辑：vim /etc/rc.local

#!/bin/sh
sleep 5
# 启用交换分区文件:
mkswap /root/swapfile
swapon /root/swapfile
modprobe zram num_devices=1
zramctl --find --size 512M --algorithm lz4 --streams 4
mkswap /dev/zram1
swapon -p 0 /dev/zram1
sysctl -w vm.swappiness=100
sync && echo 3 > /proc/sys/vm/drop_caches
sysctl -w vm.drop_caches=3

# 关闭 LED
sleep 35
echo none > /sys/class/leds/red:os/trigger
echo none > /sys/class/leds/blue:wifi/trigger
# echo none > /sys/class/leds/green:internet/trigger

# 设置cpu模式
sudo cpufreq-set -g conservative
# 调整cpu频率上下限
sudo cpufreq-set -d 200000
sudo cpufreq-set -u 800000

# TRIM优化
sudo fstrim -v /

# 清理日志
journalctl --vacuum-size=5M
```

## ssh登录显示信息

```sh
# 编辑文件：vim /etc/motd

欢迎登录 Debian 服务器！

#编辑文件：vim /etc/update-motd.d/10-uname

#!/bin/sh
# uname -snrvm

echo "-------------------------- 系统信息 --------------------------"
echo "操作系统: $(echo "$(sed 's/\\n//g;s/\\l//g' /etc/issue)")" || echo "操作系统: $(uname -o)"
echo "主机名称: $(hostname)"
echo "内核版本: $(uname -r)"
echo "软件包数量: $(dpkg --list | wc -l)"
echo "CPU架构: $(lscpu| awk '/Architecture:/ {print $NF}')"
echo "CPU核心数: $(lscpu| awk '/^CPU\(s\)/ {print $2}')"
echo "核心线程数: $(lscpu| awk '/Thread\(s\) per core:/ {print $NF}')"
echo "CPU温度: $(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null | awk '{print int($1/1000)}')°C"
if output=$(mmcli -m 0 2>&1) && [ -n "$output" ]; then
get_modem() { mmcli -m 0 2>/dev/null | grep -oiP "(?<=$1\s).*" | awk 'NR==1{print}'; };
echo "-------------------------- Modem信息 --------------------------"
[ -n "$(get_modem "own:")" ] && echo "SIM号码: $(get_modem "own:" | sed 's/^86//')"
[ -n "$(get_modem "operator name:")" ] && echo "运营商: $(get_modem "operator name:" | sed 's/CHN-UNICOM/中国联通/g; s/UNICOM/中国联通/g; s/CMCC/中国移动/g; s/CT/中国电信/g')"
[ -n "$(get_modem "state:")" ] && echo "SIM状态: $(get_modem "state:")"
[ -n "$(get_modem "power state:")" ] && echo "数据开关: $(get_modem "power state:")"
[ -n "$(get_modem "access tech:")" ] && echo "访问类型: $(get_modem "access tech:")"
[ -n "$(get_modem "signal quality:")" ] && echo "信号强度: $(get_modem "signal quality:")"
[ -n "$(get_modem "equipment id:")" ] && echo "设备ID: $(get_modem "equipment id:")"
fi
ip_address=$(ip addr show | grep -w inet | awk '{print $2}' | cut -d/ -f1)
if [ -n "$ip_address" ]; then
echo "-------------------------- 网络信息 --------------------------"
echo "内网IP:"
echo "$ip_address"
curl_output=$(curl -s -m 6 cip.cc 2>&1 | sed '/^$/d') && [ -n "$curl_output" ] && {
echo "公网IP:"
echo "$curl_output"; };
fi
interfaces=$(ifconfig | awk '/^[^ ]/ && !/lo/ {gsub(/:/,"");print $1}')
if [ -n "$interfaces" ]; then
echo "-------------------------- 接口信息 --------------------------"
echo "网络接口: "$interfaces""
convert_unit() { size=$1; awk 'BEGIN{ printf "%.2f %s", ('$size'/1024/1024), "MB" }'; }
for interface in $interfaces; do
get_bytes() { ifconfig $interface | grep -E "$1 .*bytes|$1 bytes" | sed -E "s/.*$1 bytes:([0-9]+).*/\1/;s/.*bytes ([0-9]+) .*/\1/"; }
rx=$(get_bytes RX)
tx=$(get_bytes TX)
[ $rx -gt 0 -o $tx -gt 0 ] && echo "$interface 接收: $(convert_unit $rx) 发送: $(convert_unit $tx)"
done;fi
echo "-------------------------- 内存信息 --------------------------"
mmc_info=$(cat /sys/class/mmc_host/mmc0/mmc0\:0001/life_time)
[ -n "$mmc_info" ] && echo "内存寿命: $mmc_info"
echo "硬件内存: $(free -m | awk 'NR==2{printf "%s/%sMiB (%.2f%%)\n", $3,$2,$3*100/$2 }')"
swap_info=$(free -m | awk 'NR==3{printf "%s/%sMiB (%.2f%%)\n", $3,$2,$3*100/$2}')
[ ! -z "$swap_info" ] && echo "虚拟内存: $swap_info" && sudo swapon --show
echo "-------------------------- 磁盘信息 --------------------------"
df -h
echo "-------------------------- 运行信息 --------------------------"
uptime=$(uptime | sed 's/up/已运行:/g; s/mins/分钟/g; s/min/分钟/g; s/days/天/g; s/day/天/g; s/users/个登录用户/g; s/user/个登录用户/g; s/load average/平均负载/g')
echo "本地时间: $uptime"
echo ""
```

## 内核

```sh
# 一些配置内核参数的正or负优化

# 编辑vim /etc/sysctl.conf
vm.swappiness=100
vm.vfs_cache_pressure=50
vm.panic_on_oom=0
vm.dirty_ratio=50
vm.dirty_background_ratio=30
vm.min_free_kbytes=10240
vm.max_map_count=262144
vm.dirty_expire_centisecs=3000
vm.dirty_writeback_centisecs=15000
net.ipv6.conf.all.forwarding=1
net.ipv6.conf.all.proxy_ndp=1
net.ipv6.conf.all.accept_ra=2
net.ipv4.ip_forward=1
net.core.somaxconn=2048
net.ipv4.tcp_max_syn_backlog=8192
net.core.netdev_max_backlog=3276
net.ipv4.tcp_keepalive_time=600
net.ipv4.icmp_echo_ignore_all=0
net.ipv4.tcp_abort_on_overflow=0
net.ipv4.tcp_fack=1
net.ipv4.tcp_tw_reuse=1
net.ipv4.tcp_sack=1
net.ipv4.tcp_window_scaling=1
net.ipv4.tcp_timestamps=1
net.ipv4.tcp_fastopen=3
net.ipv4.tcp_slow_start_after_idle=0
net.ipv4.tcp_fin_timeout=30
net.ipv4.tcp_keepalive_intvl=30
net.ipv4.tcp_keepalive_probes=3
net.ipv4.ip_default_ttl=128
net.core.message_burst=10
net.core.busy_read=50
net.core.optmem_max=20480
net.ipv4.tcp_challenge_ack_limit=9999
net.ipv4.tcp_max_orphans=32768
net.ipv4.tcp_max_tw_buckets=32768
net.ipv4.udp_rmem_min=8192
net.ipv4.udp_wmem_min=8192
net.ipv4.ip_local_port_range=1024 65000
net.ipv4.tcp_mem=131072 262144 524288
net.ipv4.udp_mem=262144 524288 1048576
net.ipv4.tcp_wmem=8760 256960 4088000
net.ipv4.tcp_rmem=8760 256960 4088000
net.core.rmem_default=524288
net.core.rmem_max=8388608
net.core.wmem_default=524288
net.core.wmem_max=8388608

# 在修改 /etc/sysctl.conf 文件后，需要运行以下命令使其生效：
sysctl -p
```

## cron 定时任务

```sh
crontab -e

systemctl enable cron  # 开启服务（开机自动启动服务）
systemctl disable cron # 关闭服务（开机不会自动启动服务）
systemctl start cron   # 启动服务
systemctl stop cron   # 停止服务
systemctl restart cron # 重启服务
systemctl reload cron  # 重新载入配置
systemctl status cron  # 查看服务状态
```

## smb挂载

```sh
apt install cifs-utils
mount -t cifs //192.168.2.1/h1 /mnt/h1 -o guest,iocharset=utf8,file_mode=0644,dir_mode=0777
# 旧版 smbfs
mount -t smbfs //192.168.2.1/h1 /mnt/h1 -o guest,iocharset=utf8,file_mode=0644,dir_mode=0777
```

openwrt中是使用`mount.cifs`

## 短信转发

https://github.com/lkiuyu/DbusSmsForwardCPlus

```
输入 sudo ./DbusSmsForward -fE 跳过运行模式选择直接进入邮箱转发模式
输入 sudo ./DbusSmsForward -fP 跳过运行模式选择直接进入PushPlus转发模式
输入 sudo ./DbusSmsForward -fW 跳过运行模式选择直接进入企业微信转发模式
输入 sudo ./DbusSmsForward -fT 跳过运行模式选择直接进入TGBot转发模式
输入 sudo ./DbusSmsForward -fD 跳过运行模式选择直接进入钉钉转发模式
输入 sudo ./DbusSmsForward -fB 跳过运行模式选择直接进入Bark转发模式
输入 sudo ./DbusSmsForward -sS 跳过运行模式选择直接进入短信发送界面
```

## 内网测试网速

```sh
apt install iperf3

# 服务端
iperf3 -s

# 客户端
iperf3 -c IP

# 带-R 数据从客户端到服务器
iperf3 -c IP -R

# UDP, 不带-u默认用tcp
iperf3 -c IP -u -b 300M

# 10条并行的网络
iperf3 -c IP -P 10
```

## 服务器测速

```sh
bash <(curl -sL bash.icu/speedtest)
```

```sh
wget -qO- bench.sh | bash
#或者
curl -Lso- bench.sh | bash
#或者
wget -qO- 86.re/bench.sh | bash
#或者
curl -so- 86.re/bench.sh | bash

bash <(curl -Lso- https://git.io/superspeed)
```

```sh
# Geekbench是一款跨平台的处理基准测试程序，其评分系统可分为单核和多核性能，以及模拟真实使用场景的工作负载能力。有Geekbench 2、Geekbench 3，Geekbench4以及Geekbench 5。软件基准测试适用于macOS、Windows、Linux、Android和iOS。Geekbench 4、Geekbench5还测量GPU性能包括图像处理和计算机视觉等领域。
curl -sL yabs.sh | bash
# or
wget -qO- yabs.sh | bash

wget --no-check-certificate https://github.com/teddysun/across/raw/master/unixbench.sh
chmod +x unixbench.sh
./unixbench.sh
```

## 测温控和散热

```sh
#!/bin/bash

# 定义计算阶乘的函数
factorial() {
  if [ $1 -le 1 ]; then
    echo 1
  else
    echo $(( $1 * $(factorial $(( $1 - 1 )))) )
  fi
}

# 运行计算阶乘的任务在三个核心上
(factorial 10000) &
(factorial 10000) &
(factorial 10000) &

# 输出提示信息
echo "正在运行CPU负载测试，请注意设备温度和散热情况。"

# 每秒打印当前时间，直到按 Enter 键停止测试
while true; do
  current_time=$(date "+%Y-%m-%d %H:%M:%S")
  echo "当前时间：$current_time"
  sleep 1
done
```

## 系统出现只读

```sh
e2fsck -y /dev/mmcblk0p14
```

## 切卡

```sh
echo 0 > /sys/class/leds/sim\:sel/brightness
echo 1 > /sys/class/leds/sim\:sel2/brightness
systemctl restart rmtfs
systemctl restart ModemManager
```

## ap设置

adb shell上去nmtui  
添加网桥`br0`  
网桥里添加以太网，名称设备`usb0`  
网桥里添加wi-fi，模式选成接入点，这就是ap的信息，名称设备`wlan0`  
信道选择2.4G，旁边填写6或8  
安全性选第二个wpa2，不要用wpa3，会一直提示密码错误  
回到网桥配置中，ipv4配置改为手动，并添加ip地址，填入网关的地址，默认是192.168.68.1，下面会告诉你怎么改，也可以设置成你想要的网段，那个叫网关地址的必须空着  
ipv6配置成忽略（不然下面的ipv6配置不会生效）  
移到最下面，确定，返回，退出

如果需要修改网关和分配的ip范围，可以修改`/etc/dnsmasq.conf`最后网关和分配ip范围，比如这样，改成192.168.250.1

```
domain=lan
local=/lan/
listen-address=192.168.250.1
dhcp-range=192.168.250.100,192.168.250.254,12h
```

上面加的两行可以使其可以解析局域网的主机名  
另外还需要修改`/etc/hosts`，在第一行加上`192.168.250.1 你的主机名`保证解析的可以被其他设备访问，主机名在`/etc/hostname`也是可以修改的

继续配置Ap，启用试试看，如果失败了，可以adb shell上去修改，以下命令请在adb shell下一行行运行（因为网会断）

```
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.proxy_ndp=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.accept_ra=2" >> /etc/sysctl.conf
sysctl -p
nmcli connection up br0
systemctl enable dnsmasq.service
systemctl start dnsmasq.service
nmcli connection show
nmcli connection up usb0
nmcli connection up wlan0
systemctl enable dnsmasq.service
systemctl start dnsmasq.service
```

这样就配置好了ap，试一下能不能搜到ap，能的话那就完成了  
**如果重启后获取不到ip，可以多运行几次`dnsmasq.service`那两行，后面就没有问题了**

## moden的ipv6给Ap共享

首先按照上面配置Ap，特别是`ipv6`那几行一定要配置，不然有ip没网  
安装依赖，可能会问你监听接口，回答`br0`

```
apt install ndppd radvd wide-dhcpv6-server
```

创建文件`/etc/NetworkManager/dispatcher.d/dhcpv6`贴进去

```
#!/usr/bin/env bash

interface=$1
event=$2
if [ "$interface" == "wwan0" ]; then
        prefix=$(ip -6 addr show dev wwan0| sed -e's/^.*inet6 \([^ ]*\)\/.*$/\1/;t;d'|head -n 1|cut -f'1-4' -d':')
        # just assume prefix length /64 here
        echo "get prefix $prefix::/64"|systemd-cat -t ipv6_conf
        cp /etc/ndppd.conf.me /etc/ndppd.conf
        sed -i "s/REPLACE_PREFIX_HERE/$prefix:2333::\/80/g" /etc/ndppd.conf
        cp /etc/radvd.conf.me /etc/radvd.conf
        sed -i "s/REPLACE_PREFIX_HERE/$prefix:2333::\/64/g" /etc/radvd.conf
        cp /etc/wide-dhcpv6/dhcp6s.conf.me /etc/wide-dhcpv6/dhcp6s.conf
        sed -i "s/PREFIX_MIN/$prefix:2333::2000/g" /etc/wide-dhcpv6/dhcp6s.conf
        sed -i "s/PREFIX_MAX/$prefix:2333::3000/g" /etc/wide-dhcpv6/dhcp6s.conf
        systemctl restart radvd
        systemctl restart ndppd
        systemctl stop wide-dhcpv6-server
        systemctl start wide-dhcpv6-server
        echo 1 > /proc/sys/net/ipv6/conf/all/forwarding
        sleep 10
        systemctl restart dnsmasq
        sleep 10
        echo "setting route" |systemd-cat -t ipv6_conf
        ip -6 addr add $prefix:2333::1/80 dev br0
        ip -6 route add $prefix::/65 dev br0
        ip -6 route add $prefix:8000::/65 dev br0
        ip -6 route |systemd-cat -t ipv6_conf
fi
```

然后`chmod +x /etc/NetworkManager/dispatcher.d/dhcpv6`  
还需要创建几个配置文件模板  
`/etc/ndppd.conf.me`

```
proxy wwan0 {
    router yes
    timeout 500
    ttl 30000
    rule REPLACE_PREFIX_HERE {
        auto
    }
}
```

`/etc/radvd.conf.me`

```
interface br0 {
    AdvSendAdvert on;
    AdvOtherConfigFlag on;
    AdvManagedFlag on;
    MinRtrAdvInterval 3;
    MaxRtrAdvInterval 10;
    prefix REPLACE_PREFIX_HERE {
        AdvOnLink on;
        AdvAutonomous on;
        AdvRouterAddr off;
    };
};
```

`/etc/wide-dhcpv6/dhcp6s.conf.me`

```
interface br0 {
    address-pool pool1 3600;
};

pool pool1 {
    range PREFIX_MIN to PREFIX_MAX ;
};
```

## Debian启动时从modem同步时间

因为Debian下moden的时间其实是不对的，他显示他是+8时区其实是utc时间，modem启动也巨慢，所以要这样操作一下

```
sleep 25
date -s "`mmcli -m 0  --time|grep -E "Time "  | awk -F " "  '{print $5,$NF}'|awk -F "+" '{print $1,$3}'|awk -F "T"  '{print $1,$2}'| awk '{gsub(/^\s+|\s+$/, "");print}'`" && date -s "`date -d +8hour '+%Y-%m-%d %H:%M:%S'`"
systemctl start dnsmasq.service
```

加入`/etc/rc.local`的`exit 0`上面（最好写在你写的内容的最上面）

## Btrfs修改压缩率

使用更高的压缩率可以减少空间占用，但占用更多的cpu  
本着emmc慢成狗cpu十分富裕，可以考虑采用更高的压缩率，默认3，可以设置1到15，不建议大于8  
修改`/etc/fstab`将其中`zstd`改为`zstd:6`即可将压缩等级改为6  
为了避免修改错误，导致无法开机，可以先在下面这条命令上做修改，并运行进行挂载测试(比配置中的多了一个remount的选项)

```
UUID=7f208f70-fee3-4bbe-8f3f-c1e95dd25afe  /  btrfs  defaults,noatime,compress=zstd,subvol=/subvolumes/root 0 1
UUID=7f208f70-fee3-4bbe-8f3f-c1e95dd25afe  /home  btrfs  defaults,noatime,compress=zstd,subvol=/subvolumes/home 0 0
```

可以使用这条命令对根分区进行压缩，系统占用大约700m左右，压缩从3调成6可以把占用从2g降到1.4g

```
sudo btrfs filesystem defragment -r -v -czstd /
```

compsize 可以分析压缩率
