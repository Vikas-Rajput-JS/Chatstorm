const animatelogger = async (text) => {
  const chalkAnimation = await import("chalk-animation");
  const animation = chalkAnimation.default.rainbow(text || "",2).start();
};

module.exports = animatelogger;
