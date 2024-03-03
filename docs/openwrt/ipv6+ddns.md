# openwrt+ipv6+ddsn+cloudflare+v4tov6

## 快速介绍

![](https://img.hellohxx.top/202311230402582.png)

ipv6地址共 128 位(二进制),转化成16进制共32位, 每4位分成1组, 用分号隔开, 共8组
如果有多个零, 可以省略成`::`, ipv6地址中只能有一个`::`

```sh
# 同一组地址
fddd:f00d:cafe:0000:0000:0000:0000:0001  
fddd:f00d:cafe:0:0:0:0:1  
fddd:f00d:cafe::1
```

前三组是路由前缀
第48-64位（第四个小组）能切割作为不同子网, 和前三组加起来就是子网前缀
后四组64位是给子网内设备分配地址的

2开头的是公网地址, f开头的是内网地址

3大运营商IPv6地址前缀：  
* 中国移动：2409:8000::/20
* 中国电信：240e::/20
* 中国联通：2408:8000::/20

`ifconfig` 带`temporary`是临时地址, 为了安全,

## 检测v6的网站

获取ipv4 url
http://checkip.dyndns.com
http://4.ipw.cn

获取ipv6 url
http://checkipv6.dyndns.com/
http://6.ipw.cn/

检测优先级
https://ipw.cn/

生成ipv6前缀
https://cd34.com/rfc4193/

## 获取ipv6-pd

之前能够获取到pd地址, 换了路由后获取不到, 只下发了 /64 的地址, 无法再分配

方案1: 实测有效

```
添加防火墙规则，允许 ipv6 udp 456 端口和 ipv6 的 igmp 协议进入本设备
```

方案2:

```sh
vim /etc/hotplug.d/iface/99-ipv6
#!/bin/sh
[ "$ACTION" = ifup ] || exit 0
[ "$INTERFACE" = wan ] || exit 0
#sleep 18s 从我的粗略测试来看，有没有这一行都能正常获得我们想要的效果
uci set network.globals.ula_prefix="$(ip -6 route show | grep default | sed -e 's/^.*from //g' | sed 's/ via.*$//g')"
uci commit network
/sbin/ifup lan

chmod a+x /etc/hotplug.d/iface/99-ipv6

重启
```

```sh
# 如果无法升级版本，可以利用策略路由，把来自 WAN 的 IPv6 无脑（删掉 路由到 LAN：
mkdir -p /etc/ppp/ip-up.d
vi /etc/ppp/ip-up.d/00-pppoe-ipv6.sh

# 脚本内容
#!/bin/sh
[ "$1" = "pppoe-wan" ] || exit 0
ip -6 route add default dev br-lan table 6
ip -6 rule add iif $1 lookup 6

# 记得加可执行权限 chmod +x /etc/ppp/ip-up.d/00-pppoe-ipv6.sh
```

方案3:

```sh

vi /etc/hotplug.d/iface/99-ipv6
===
#!/bin/sh
[ "$ACTION" = ifup ] || exit 0
[ "$INTERFACE" = wan ] || exit 0
uci set network.globals.ula_prefix="$(ip -6 route show | grep default | sed -e 's/^.*from //g' | sed 's/ via.*$//g')"
uci commit network
/sbin/ifup lan
===

chmod a+x /etc/hotplug.d/iface/99-ipv6
reboot
```

## 设置ipv6

教程: https://post.smzdm.com/p/awzodmpp/?sort_tab=hot%2525252F

### 添加wan接口

1. 添加新的接口, 名称填 wwan6 (原来ipv4的接口是wwan), 协议选 dhcpv6, 设备选 接口别名@wwan
2. 请求ipv6地址选 try, 长度选自动

![](https://img.hellohxx.top/202311230342036.png)  

3. 高级设置, 委托前缀打勾, 分配长度禁用

![](https://img.hellohxx.top/202311230343616.png)  

4. 防火墙选 wan
5. dhcp服务器不开启
6. 最终获取接口能够获取到v6地址, 如图, 关键是ipv6-pd, :/62(反正小于等于64) 这个地址段, 可以供我们分配

![](https://img.hellohxx.top/202311230347209.png)

### 修改lan接口

#### 高级设置

1. 委托前缀不需要, 因为设备都在路由下, 不需要再切割地址
2. 分配长度选64
3. 分配提示不需要(自定义子网的最后一位地址)
4. 后缀填 `::1`

![](https://img.hellohxx.top/202311230348839.png)
3. 最终如图所示

![](../assets/Pasted%20image%2020231123035753.png)

#### dhcp服务器

1. ipv6设置, ra模式选服务器, dhcpv6选服务器(也有的说开了slaac,就不要用dhcpv6, 让设备自己注册), ndp禁用

![](https://img.hellohxx.top/202311230352249.png)  

2. ipv6ra 设置, 启用slaac, ra标记受管配置, 其他配置

![](https://img.hellohxx.top/202311230354136.png)

### 如果没有下发pd

1. 修改wwan6接口, 配置DHCP服务器
2. 勾选忽略此接口，并且在IPv6设置里勾选 指定的主接口，RA服务、DHCPv6服务、NDP代理都选择中继模式, 学习路由
3. 修改lan, DHCP服务器->IPv6设置里同样全部选择中继模式, 学习路由. 不勾选指定主接口

## ddns

### 使用 ddns 插件

教程: https://blog.upx8.com/3110

缺点: 似乎不能批量更新域名, 改为 ddns-go

需要安装的插件 `luci-i18n-ddns-zh-cn curl ddns-scripts-cloudflare`

### 使用ddns-go

1. 用上面的url, 测试自己是否有ipv6

2. 到cloudflare添加 `AAAA` 记录

![](https://img.hellohxx.top/202311230326472.png)

3. 安装插件 `luci-i18n-ddns-go-zh-cn`

4. 先改下端口, 不要用默认的`[::]:1`

![](../assets/Pasted%20image%2020231123031728.png)

5. dns选择 cloudflare, 需要到 cloudflare 设置 token

创建令牌->编辑区域 DNS (使用模板)-->区域资源选择所有区域

![](https://img.hellohxx.top/202311230318454.png)

![](../assets/Pasted%20image%2020231123032346.png)  

### 钩子脚本(openwrt)

> 只有接口发生变化时才运行, 而不是定时运行

https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-update-dns-record

```sh
vim /etc/hotplug.d/iface/99-custom-script
===
#!/bin/sh

# 指定要监测的网络接口
interface="br-lan"

# 获取当前的IPv6地址（以"24"开头）
current_ipv6=$(ip -6 addr show dev $interface | awk '/inet6 .* global/ { print $2 }' | awk -F "/" '{ print $1 }')
echo "当前的ipv6地址: $current_ipv6"
# 检查是否获取到了有效的IPv6地址
if [ -n "$current_ipv6" ]; then
    # 保存之前的IPv6地址，如果为空则是第一次运行
    if [ -f /tmp/previous_ipv6 ]; then
        previous_ipv6=$(cat /tmp/previous_ipv6)
    else
        previous_ipv6=""
    fi

    # 检查当前IPv6地址是否和之前保存的不同
    if [ "$current_ipv6" != "$previous_ipv6" ]; then
        # 更新之前保存的IPv6地址
root@ImmortalWrt:/etc/hotplug.d/iface# cat 99-custom-script
#!/bin/sh

# 指定要监测的网络接口
interface="br-lan"

# 获取当前的IPv6地址（以"24"开头）
current_ipv6=$(ip -6 addr show dev $interface | awk '/inet6 .* global/ { print $2 }' | awk -F "/" '{ print $1 }')
echo "当前的ipv6地址: $current_ipv6"
# 检查是否获取到了有效的IPv6地址
if [ -n "$current_ipv6" ]; then
    # 保存之前的IPv6地址，如果为空则是第一次运行
    if [ -f /tmp/previous_ipv6 ]; then
        previous_ipv6=$(cat /tmp/previous_ipv6)
    else
        previous_ipv6=""
    fi

    # 检查当前IPv6地址是否和之前保存的不同
    if [ "$current_ipv6" != "$previous_ipv6" ]; then
        # 更新之前保存的IPv6地址
        echo "更新地址"
        echo "$current_ipv6" > /tmp/previous_ipv6
        # 执行你的操作，比如运行一个脚本
        echo "开始更新"
        /root/cloudflare.sh
    else
        echo "不需要更新"
    fi
else
    # 在没有有效IPv6地址的情况下执行的操作，或者可以选择跳过
    echo "当前未获取到有效的IPv6地址"
fi
===
chmdod +x /etc/hotplug.d/iface/99-custom-script
```

更新单个域名

```sh
vim /root/cloudflare.sh
===
#!/bin/sh
# 监测的网络接口，例如 eth0
interface="br-lan"

ZoneID="YOUR_ZONE_ID"
RecordID="YOUR_RECORD_ID"
Email="YOUR_EMAIL"
Token="YOUR_API_TOKEN"
Fullname="YOUR_FULL_DOMAIN_NAME"

IP6=$(ip -6 addr show dev $interface | awk '/inet6 .* global/ { print $2 }' | awk -F "/" '{ print $1 }')
if [ -z "\$IP6" ]; then
  exit
fi
echo $IP6
response=$(curl -s -o /dev/null -w %{http_code} --request PUT \
  --url "https://api.cloudflare.com/client/v4/zones/${ZoneID}/dns_records/${RecordID}" \
  --header "Content-Type: application/json" \
  --header "X-Auth-Email: ${Email}" \
  --header "Authorization: Bearer ${Token}" \
  --data "{
  \"type\": \"AAAA\",
  \"name\": \"${Fullname}\",
  \"content\": \"${IP6}\",
  \"proxied\": false
  }")
if [ "$response" == "200" ]; then
  echo "DNS记录更新成功"
else
  echo "DNS记录更新失败，HTTP状态码: $response"
fi
===
chmod +x /root/cloudflare.sh
```

更新多个域名

```sh
#!/bin/sh

# 监测的网络接口，例如 eth0
interface="br-lan"

# 共享的 Cloudflare 帐户信息
Email="YOUR_EMAIL"
Token="YOUR_API_TOKEN"
ZoneID="YOUR_ZONE_ID"

# 获取一次 IPv6 地址
IP6=$(ip -6 addr show dev $interface | awk '/inet6 .* global/ { print $2 }' | awk -F "/" '{ print $1 }')

# Cloudflare 域名信息数组
# 每个域名的信息包括：Fullname 和 RecordID
declare -A domains=(
  ["YOUR_FULL_DOMAIN_NAME1"]="YOUR_RECORD_ID1"
  ["YOUR_FULL_DOMAIN_NAME2"]="YOUR_RECORD_ID2"
  # 可以根据需要添加更多 Fullname 和 RecordID
)

# 如果IPv6为空，不执行循环
if [ -z "$IP6" ]; then
  echo "无法获取有效的IPv6地址，退出脚本"
  exit 1
fi
echo "IPv6地址：$IP6"

for Fullname in "${!domains[@]}"; do
  RecordID="${domains[$Fullname]}"

  # 在这里可以继续进行域名更新的操作
  response=$(curl -s -o /dev/null -w %{http_code} --request PUT \
    --url "https://api.cloudflare.com/client/v4/zones/${ZoneID}/dns_records/${RecordID}" \
    --header "Content-Type: application/json" \
    --header "X-Auth-Email: ${Email}" \
    --header "Authorization: Bearer ${Token}" \
    --data "{
      \"type\": \"AAAA\",
      \"name\": \"${Fullname}\",
      \"content\": \"${IP6}\",
      \"proxied\": false
    }")

  if [ "$response" == "200" ]; then
    echo "${Fullname} DNS记录更新成功"
  else
    echo "${Fullname} DNS记录更新失败，HTTP状态码: $response"
  fi
done
```

查询 RecordID

```sh
#!/bin/bash
ZONE_ID="你的 Zone ID"
API_TOKEN="你的API Token"
read -p "请输入子域名: " NAME
curl -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$NAME" \
-H "Authorization: Bearer $API_TOKEN" \
-H "Content-Type: application/json"
```

###  钩子脚本(ubuntu)

> 只有接口发生变化时才运行, 而不是定时运行

https://appscross.com/2023/09/one-click-ddns6-for-linux/

https://github.com/evanawn65/appscross/raw/main/99-ip6-address-change

```sh
curl -o intstall-cf-ddns6.sh -sSL https://appscross.com/Sharetools/Tools%20Share/DDNS6/install-cf-ddns.sh && chmod +x intstall-cf-ddns6.sh
./intstall-cf-ddns6.sh
```

```sh
sudo nano /etc/NetworkManager/dispatcher.d/99-ip6-address-change

#!/bin/bash
IFACE="$1"
REASON="$2"
if [ "$IFACE" = "eth0" ] && [ "$REASON" = "dhcp6-change" ]; then
    # 调用 DNS 记录更新脚本
    /bin/cf-ddns6.sh
fi

# 赋权、属组、属主设为root
```

```sh
#!/bin/bash

# 需要jq

#LEDE/Openwrt may need install ca-bundle curl(opkg install ca-bundle curl)

#Add you custom record to the CloudFlare first.

#Your sub domain
SUB_DOMAIN="webdav.shiyitopo.tech"
#dash --> example.com --> Overview --> Zone ID:
#https://dash.cloudflare.com/_your_account_id_/example.com
ZONE_ID=""
#API Tokens
#https://dash.cloudflare.com/profile/api-tokens
#Manage access and permissions for your accounts, sites, and products
#example.com- Zone:Read, DNS:Edit
TOKEN_ID=""
#The path of jq binaries . Download from https://stedolan.github.io/jq/download/
#If the system has installed jq. Just typed jq.
#If you custom a special binary. Just type the path of jq
JQ_PATH="/root/jq-linux64"

if [ -n "$DNS_ZONE_ID" ]; then
    echo "The user has not configure the the ZONE ID "
    exit 1
fi

echo "Your dns zone id is: $ZONE_ID"
jsonResult=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
    -H "Authorization: Bearer ${TOKEN_ID}" \
    -H "Content-Type: application/json")

curlResult=$(echo $jsonResult | $JQ_PATH -r .success)

if [ "$curlResult" = true ]; then
    echo "Get dns record success."
else
    echo "Get dns record fail.$jsonResult"
    exit 1
fi

recordSize=$(echo $jsonResult | $JQ_PATH .result | $JQ_PATH length)
echo "Total found $recordSize record"

index=0
while [ $index -lt $recordSize ]; do
    tResult=$(echo $jsonResult | $JQ_PATH -r .result[$index])
    tmpDomain=$(echo $tResult | $JQ_PATH -r .name)
    type=$(echo $tResult | $JQ_PATH -r .type)

    if [ "$tmpDomain"x = "$SUB_DOMAIN"x ]; then
        if [ "AAAA"x = "$type"x ]; then
            echo "Found AAAA domain:$tmpDomain"
            identifier_v6=$(echo $tResult | $JQ_PATH -r .id)
        elif [ "A"x = "$type"x ]; then
            echo "Found A domain:$tmpDomain"
            identifier_v4=$(echo $tResult | $JQ_PATH -r .id)
        else
            echo "Please add the A or AAAA record manually first."
        fi
    fi
    index=$(expr $index + 1)
done

if [ -z "$identifier_v4" ] && [ -z "$identifier_v6" ]; then
    echo "Get '$SUB_DOMAIN' identifier failed. Please add the A or AAAA record manually first."
    exit 1
else
    echo "Get '$SUB_DOMAIN' identifier success. [A] identifier:$identifier_v4 [AAAA] identifier:$identifier_v6"
fi

if [ -z "$identifier_v4" ]; then
    echo "IPv4 address are not required."
else
    #IP=$(curl -s http://members.3322.org/dyndns/getip)
    IP=$(curl -s http://ip.3322.net/)
    regex='\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b'
    matchIP=$(echo $IP | grep -E $regex)
    if [ -n "$matchIP" ]; then
        echo "[$IP] IPv4 matches..."
        jsonResult=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${identifier_v4}" \
            -H "Authorization: Bearer ${TOKEN_ID}" \
            -H "Content-Type: application/json" \
            --data '{"type":"A","name":"'${SUB_DOMAIN}'","content":"'${IP}'","ttl":1,"proxied":false}')
        curlResult=$(echo $jsonResult | $JQ_PATH -r .success)

        if [ "$curlResult" = true ]; then
            echo "Update IPv4 dns record success."
        else
            echo "Update IPv4 dns record fail."
        fi
    else
        echo "[$IP]IPv4 doesn't match!"
    fi
fi

if [ -z "$identifier_v6" ]; then
    echo "IPv6 addresses are not required."
else
    #IP=$(curl -6 ip.sb)
    IP=$(ip addr show dev  ens18|sed -e's/^.*inet6 \([^ ]*\)\/.*$/\1/;t;d'|grep 2409|head -1)
    regex='^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$'
    matchIP=$(echo $IP | grep -E $regex)
    if [ -n "$matchIP" ]; then
        echo "[$IP] IPv6 matches..."
        echo "Update IPv6 ..."
        jsonResult=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${identifier_v6}" \
            -H "Authorization: Bearer ${TOKEN_ID}" \
            -H "Content-Type: application/json" \
            --data '{"type":"AAAA","name":"'${SUB_DOMAIN}'","content":"'${IP}'","ttl":1,"proxied":true}')
        curlResult=$(echo $jsonResult | $JQ_PATH -r .success)

        if [ "$curlResult" = true ]; then
            echo "Update IPv6 dns record success."
        else
            echo "Update IPv6 dns record fail."
        fi
    else
        echo "[$IP] IPv6 doesn't match!"
    fi
fi
```

## ipv4访问ipv6

利用 cloudflare的cdn, 要开启小云朵

ipv4 --> cloudflare CDN --> ipv6

https://mymuwu.net/?p=489

```sh
# http 能走cdn的端口
80 8080 8880 2052 2082 2086 2095
# https 能走cdn的端口
443  2053  2083  2087  2096  8443
```

### 路由器设置

1. 防火墙放行对应的ipv6端口

网络 -- 防火墙 -- 通信规则

![](https://img.hellohxx.top/202311230331984.png)  

2. 端口转发

安装 `luci-i18n-socat-zh-cn`

添加端口转发, 把ipv6转发到ipv4地址的端口
安装完第一次添加状态是x, 重启下 socat 和 firewall 服务
也可以转发到局域网设备的端口, 这样局域网设备虽然也有ipv6, 但不用ddns, 只需要路由转发就够了

![](https://img.hellohxx.top/202311230332967.png)  

3. 这样访问时还需要在域名后添加 2052 端口, 利用 cloudflare 的规则可以自动添加

规则 --> Origin Rules --> 创建规则 --> 自定义筛选表达式 --> 主机名等于 --> 重写端口到2052

cloudflare ddns 脚本

## ipv4优先

```sh
vim /etc/gai.conf

precedence ::ffff:0:0/96  200
```