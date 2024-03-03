# scorpio

## 下载

1. mainline

https://wiki.postmarketos.org/wiki/Xiaomi_Mi_Note_2_(xiaomi-scorpio)

2. config

https://gitlab.com/postmarketOS/pmaports/-/blob/master/device/community/linux-postmarketos-qcom-msm8996/config-postmarketos-qcom-msm8996.aarch64

3. Firmware

https://gitlab.com/Tooniis/firmware-xiaomi-scorpio

https://gitee.com/meiziyang2023/xiaomi-note2-ubuntu-ports/tree/master/firmware

## 脚本修改

```sh
vim get_kernel_files.sh

# get_kernel_files.sh
# 改这里 *scorpio*.dtb
mkdir ./tmp_mkboot
rm  ./tmp_mkboot/*
cp ./linux/arch/arm64/boot/dts/qcom/*scorpio*.dtb ./tmp_mkboot/dtb
cp ./linux/arch/arm64/boot/Image.gz ./tmp_mkboot/
cp ubuntu/boot/initrd* ./tmp_mkboot/initrd.img
```

note2的mkbootimg参数和note4x的一样

其它参考note4x的教程