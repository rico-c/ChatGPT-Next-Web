import styles from "./auth.module.scss";
import { IconButton } from "./button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";
import Logo from "../icons/logo.svg";
import { useMobileScreen } from "@/app/utils";
import BotIcon from "../icons/bot.svg";
import { getClientConfig } from "../config/client";
import LeftIcon from "@/app/icons/left.svg";
import { safeLocalStorage } from "@/app/utils";

import clsx from "clsx";
import { InputNumber, Table } from "antd";
import { AlipayOutlined } from "@ant-design/icons";
import { useUserInfo } from "../hooks/useUser";
import { buy_process } from "../utils/buy";

const storage = safeLocalStorage();

const columns = [
  {
    title: "产品",
    dataIndex: "product",
    key: "product",
  },
  {
    title: "模型",
    dataIndex: "model",
    key: "model",
  },
  {
    title: "输入定价",
    dataIndex: "input",
    key: "input",
  },
  {
    title: "输出定价",
    dataIndex: "output",
    key: "output",
  },
  {
    title: "模型特点",
    dataIndex: "info",
    key: "info",
  },
];

const dataSource = [
  {
    key: "1",
    product: "GPT-4o",
    model: "gpt-4o",
    input: "$2.50 / 100万 tokens",
    output: "$10.00 / 100万 tokens",
    info: "适合快速处理大多数任务",
  },
  {
    key: "3",
    product: "GPT-o1",
    model: "o1-preview",
    input: "$15.00 / 100万 tokens",
    output: "$60.00 / 100万 tokens",
    info: "深度逻辑推理、价格偏高",
  },
  {
    key: "2",
    product: "GPT-4o",
    model: "gpt-4o-mini",
    input: "$0.15 / 100万 tokens",
    output: "$0.60 / 100万 tokens",
    info: "价格低",
  },
  {
    key: "5",
    product: "GPT-4",
    model: "gpt-4",
    input: "$30.00 / 100万 tokens",
    output: "$60.00 / 100万 tokens",
    info: "传统GPT4",
  },
];

export function AuthPage() {
  const navigate = useNavigate();
  const accessStore = useAccessStore();
  const [money, setMoney] = useState(20);
  const { userInfo }: any = useUserInfo();

  const handlePay = async () => {
    // if (!money || money < 20) {
    //   alert("充值金额不能小于20元");
    //   return;
    // }
    buy_process({
      price: money,
      product_name: "buygpt",
      product_id: "buygpt",
      payWay: "alipay",
      userId: userInfo?.user_id,
    });
  };

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles["auth-page"]}>
      <TopBanner></TopBanner>
      <div className={styles["auth-header"]}>
        <IconButton
          icon={<LeftIcon />}
          text={Locale.Auth.Return}
          onClick={() => navigate(Path.Home)}
        ></IconButton>
      </div>
      <div className={clsx("no-dark", styles["auth-logo"])}>
        <BotIcon />
      </div>
      <div className={styles["auth-title"]}>
        来自官方OPENAI的稳定ChatGPT服务
      </div>
      <div className={styles["auth-tips"]}>根据您的用量灵活进行充值</div>
      <div
        className={styles["auth-tips"]}
        style={{
          marginBottom: "20px",
          marginTop: "20px",
          fontSize: "14px",
          fontWeight: "bold",
          backgroundColor: "#e0e0e0",
          padding: "6px 15px",
          borderRadius: "5px",
        }}
      >
        当前余额: ￥
        {userInfo?.balance ? Number(userInfo?.balance).toFixed(2) : "加载中"}
      </div>
      <div
        className={styles["auth-actions"]}
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "row",
          gap: "10px",
        }}
      >
        <InputNumber
          prefix="￥"
          style={{ width: "200px" }}
          placeholder="充值金额，最小20元"
          // min={20}
          value={money}
          onChange={(e) => setMoney(e as number)}
        />
        <IconButton
          icon={<AlipayOutlined />}
          style={{ width: "150px", backgroundColor: "#1678ff" }}
          text={"充值余额"}
          type="primary"
          onClick={handlePay}
        />
      </div>
      <Table
        style={{ margin: "30px 0" }}
        dataSource={dataSource}
        columns={columns}
        bordered
        pagination={false}
      />
    </div>
  );
}

function TopBanner() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useMobileScreen();
  useEffect(() => {
    // 检查 localStorage 中是否有标记
    const bannerDismissed = storage.getItem("bannerDismissed");
    // 如果标记不存在，存储默认值并显示横幅
    if (!bannerDismissed) {
      storage.setItem("bannerDismissed", "false");
      setIsVisible(true); // 显示横幅
    } else if (bannerDismissed === "true") {
      // 如果标记为 "true"，则隐藏横幅
      setIsVisible(false);
    }
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    storage.setItem("bannerDismissed", "true");
  };

  if (!isVisible) {
    return null;
  }
  return (
    <div
      className={styles["top-banner"]}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={clsx(styles["top-banner-inner"], "no-dark")}>
        <Logo
          style={{ width: "30px", height: "30px", marginRight: "5px" }}
          className={styles["top-banner-logo"]}
        ></Logo>
        ButGPT使用OPENAI官方接口转发，高速稳定，您可以根据用量灵活购买
        {/* <span>{Locale.Auth.TopTips}</span> */}
      </div>
    </div>
  );
}
