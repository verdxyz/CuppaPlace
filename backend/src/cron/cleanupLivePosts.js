const { CafeLivePost } = require("../models");
const { Op } = require("sequelize");

async function cleanupLivePosts() {
  await CafeLivePost.destroy({
    where: {
      expires_at: {
        [Op.lte]: new Date(),
      },
    },
  });
  console.log("[CRON] expired live posts cleaned");
}

module.exports = cleanupLivePosts;
