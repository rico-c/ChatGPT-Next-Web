import dayjs from "dayjs";
// import { getHost } from './gethost'
// @ts-expect-error
import md5 from "md5";
import { nanoid } from "nanoid";
require("dotenv").config();

export const buy_process = ({
  price,
  product_name,
  product_id,
  payWay,
  userId,
}: any) => {
  const callback = `${document.location.origin}`;
  const callbackApi = `${document.location.origin}/api/orderreturn`;
  const orderId = `${dayjs().format("YYYYMMDDHHmm")}-${userId}-${nanoid()}`;
  const url = `money=${price}&name=${product_name}&notify_url=${callbackApi}&out_trade_no=${orderId}&param=${product_id}&pid=25770&return_url=${callback}&sitename=BuyGPT&type=${payWay}`;
  const sign = md5(url + process.env.RAINBOW_PAY);

  window.open(
    `https://pay.v8jisu.cn/submit.php?${url}&sign=${sign}&sign_type=MD5`,
  );
  return orderId;
};
