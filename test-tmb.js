import fetch from "node-fetch";

async function test() {
  const appId=process.env.TMB_APP_ID;
  const appKey=process.env.TMB_APP_KEY;
  let res = await fetch(`https://api.tmb.cat/v1/ibus/stops/122?app_id=${appId}&app_key=${appKey}`);
  console.log("ibus 122:", await res.text());
  
  res = await fetch(`https://api.tmb.cat/v1/itransit/metro/estacions?estacions=122&app_id=${appId}&app_key=${appKey}`);
  console.log("itransit metro estacions:", await res.text());
}
test()
