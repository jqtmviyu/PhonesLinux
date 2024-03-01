# 编译lk bootloader

这里不再介绍lk2nd的编译，只介绍lk1st的编译方法。  
原理其实很简单，交叉编译后得到aboot之后使用dragonboard提供的密匙签名即可。

- 注意：不适用于开启secureboot的设备，如果你的设备不在支持列表之内，教程的有效性将得不到保证。
- uz801和sp970由于某些原因在lk阶段点不亮led。
- 目前最为完美的机型是UFI001B/C系列

克隆lk2nd项目

```
$  git clone https://github.com/OpenStick/lk2nd.git
```

进入lk2nd目录使用以下指令开始编译

```
make TOOLCHAIN_PREFIX=arm-none-eabi- lk1st-msm8916 -j8
```

之后会出现build-lk1st-msm8916目录，复制产物**emmc_appsboot.mbn**备用。

克隆签名工具qtestsign

```
$ git clone https://github.com/msm8916-mainline/qtestsign
```

将前面的**emmc_appsboot.mbn**放入qtestsign目录，之后输入以下指令。

```
$ ./qtestsign.py aboot emmc_appsboot.mbn
```

之后会生成**emmc_appsboot-test-signed.mbn**,刷入即可。

```
$ fastboot flash aboot emmc_appsboot-test-signed.mbn
```