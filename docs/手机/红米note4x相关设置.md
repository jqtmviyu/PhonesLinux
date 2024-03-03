# 红米note4x相关设置

## 关闭屏幕灯光

```sh
echo 1 > /sys/class/backlight/backlight/bl_power
```

```sh
#!/bin/bash
file_path="/sys/class/backlight/backlight/bl_power"

current_value=$(cat "$file_path")

if [ "$current_value" -eq 0 ]; then
    new_value=1
else
    new_value=0
fi

echo $new_value > $file_path
```

## 查看电流

```sh
/sys/class/power_supply/qcom-battery/current_now
```

## 查看电量

```sh
apt install upower
upower -i /org/freedesktop/UPower/devices/battery_qcom_battery
```

## 查看频率

```sh
cat /sys/devices/system/cpu/cpufreq/policy0/cpuinfo_cur_freq
```

## 超频

查看当前支持的cpu频率

```sh
cd /sys/devices/system/cpu/cpufreq/policy0/
# 频率范围
cat scaling_available_frequencies
# 最大频率
cat scaling_max_freq 
```

```sh
drivers/clk/qcom/a53-pll.c

# 默认
===
static const struct pll_freq_tbl a53pll_freq[] = {
	{  998400000, 52, 0x0, 0x1, 0 },
	{ 1094400000, 57, 0x0, 0x1, 0 },
	{ 1152000000, 62, 0x0, 0x1, 0 },
	{ 1209600000, 63, 0x0, 0x1, 0 },
	{ 1248000000, 65, 0x0, 0x1, 0 },
	{ 1363200000, 71, 0x0, 0x1, 0 },
	{ 1401600000, 73, 0x0, 0x1, 0 },
	{ }
};
===
```

```sh
# 频率补充
drivers/soc/qcom/cpr3pd.c
```

```sh
# 设备树
# 把0x81改为0x85
arch/arm64/boot/dts/qcom/msm8953.dtsi
===
	cpu0_opp: cpu0-opp-table {
		compatible = "operating-points-v2-qcom-cpu";
		nvmem-cells = <&cpu_speed_bin>;
		opp-shared;

		opp-652800000 {
			opp-hz = /bits/ 64 <652800000>;
			opp-supported-hw = <0xC5>;
			required-opps = <&cpr_opp1>;
			opp-suspend;
		};
	
		opp-1036800000 {
			opp-hz = /bits/ 64 <1036800000>;
			opp-supported-hw = <0xC5>;
			required-opps = <&cpr_opp2>;
		};
	
		opp-1248000000 {
			opp-hz = /bits/ 64 <1248000000>;
			opp-supported-hw = <0xC5>;
			required-opps = <&cpr_opp3>;
		};
	
		opp-1401600000 {
			opp-hz = /bits/ 64 <1401600000>;
			opp-supported-hw = <0xC5>;
			required-opps = <&cpr_opp4>;
		};
	
		opp-1689600000 {
			opp-hz = /bits/ 64 <1689600000>;
			opp-supported-hw = <0xC5>;
			required-opps = <&cpr_opp5>;
		};
	
		opp-1804800000 {
			opp-hz = /bits/ 64 <1804800000>;
			opp-supported-hw = <0xC5>;
			required-opps = <&cpr_opp6>;
		};
	
		opp-1958400000 {
			opp-hz = /bits/ 64 <1958400000>;
			opp-supported-hw = <0x85>;
			required-opps = <&cpr_opp7>;
		};
	
		opp-2016000000 {
			opp-hz = /bits/ 64 <2016000000>;
			opp-supported-hw = <0x85>;
			required-opps = <&cpr_opp8>;
		};
	
		opp-2150400000 {
			opp-hz = /bits/ 64 <2150400000>;
			opp-supported-hw = <0x81>;
			required-opps = <&cpr_opp9>;
		};
	
		opp-2208000000 {
			opp-hz = /bits/ 64 <2208000000>;
			opp-supported-hw = <0x81>;
			required-opps = <&cpr_opp10>;
		};
	};
===
```

## rc.local开机脚本

```sh
cat >>/etc/systemd/system/rc-local.service<<EOF
[Unit]
Description=/etc/rc.local
ConditionPathExists=/etc/rc.local

[Service]
Type=forking
ExecStart=/etc/rc.local start
TimeoutSec=0
StandardOutput=tty
RemainAfterExit=yes
SysVStartPriority=99

[Install]
WantedBy=multi-user.target
EOF

cat >/etc/rc.local<<EOF 
#!/bin/sh -e
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#

exit 0
EOF

systemctl daemon-reload && systemctl enable rc-local
```

## 扩大分区

如果发现分区大小和rootfs一样大

ext4:

方法一:

```sh
#!/bin/bash

resize2fs $(df / | awk '$NF=="/"{print $1}')
# resize2fs /dev/mmcblk0p30
# resize2fs /dev/mmcblk1p30
```

方法二:

制作rootfs时

```sh
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

## 开启串口登录

```sh
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

## usb 网络共享

**待完善...**

USB tethering support

https://github.com/ubports/ubuntu-touch/issues/1393

https://www.kancloud.cn/handsomehacker/openstick/2637560

1. 内核编译项

```
https://wiki.postmarketos.org/wiki/Kernel_configuration

CONFIG_USB_ETH
CONFIG_USB_ETH_RNDIS

```

## adbd

**待完善...**

## 定量充电脚本

```sh
#!/bin/bash

USB_PATH="/sys/class/power_supply/qcom-smbchg-usb"
MAX_CAPACITY=99
MIN_CAPACITY=80
CURRENT_CAPACITY=$(cat /sys/class/power_supply/qcom-battery/capacity)
echo Now Battery Capacity: $(cat /sys/class/power_supply/qcom-battery/capacity)
if [ $CURRENT_CAPACITY -ge $MAX_CAPACITY ]; then
    echo "Battery capacity is above $MAX_CAPACITY%. Charging stopped."
    echo 0 > $USB_PATH/input_current_limit
elif [ $CURRENT_CAPACITY -le $MIN_CAPACITY ]; then
    echo "Battery capacity is below $MIN_CAPACITY%. Charging started."
    echo 300000 > $USB_PATH/input_current_limit
fi
```

## mkbootimg 参数

https://wiki.postmarketos.org/wiki/Huawei_Honor_6X_(huawei-berlin)

https://github.com/anestisb/android-unpackbootimg

https://github.com/OpenStick/OpenStick/issues/7

```sh
git clone https://github.com/anestisb/android-unpackbootimg
make -C android-unpackbootimg

./android-unpackbootimg/unpackbootimg -i boot.img -o boot/
# 打印出上面的mkbootimg 参数

===
BOARD_KERNEL_CMDLINE PMOS_NO_OUTPUT_REDIRECT  pmos_boot_uuid=518e9aa3-4de5-42c3-b6ec-6f1d8384030a pmos_root_uuid=19d04306-f22f-4009-ad75-a6afd390fba8
BOARD_KERNEL_BASE 80000000
BOARD_NAME 
BOARD_PAGE_SIZE 4096
BOARD_HASH_TYPE sha1
BOARD_KERNEL_OFFSET 00008000
BOARD_RAMDISK_OFFSET 01000000
BOARD_SECOND_OFFSET 00f00000
BOARD_TAGS_OFFSET 00000100
===
```

## 内核开启smb功能

`cifs utf8`

## 切换OTG主从模式

```sh
# 625可以这样切主从
# 主机模式：
echo host > /sys/kernel/debug/usb/7000000.usb/mode
# 从设备模式
echo device > /sys/kernel/debug/usb/7000000.usb/mode
```