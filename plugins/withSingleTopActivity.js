const { withAndroidManifest } = require('expo/config-plugins');

/**
 * RevenueCat asks for the main activity to use launchMode "singleTop" instead of Expo's
 * default "singleTask": with singleTask, leaving the app mid-purchase (for example to
 * confirm a payment in a bank app) can cancel the purchase.
 */
module.exports = function withSingleTopActivity(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    const mainActivity = application?.activity?.find(
      (activity) => activity.$['android:name'] === '.MainActivity',
    );
    if (mainActivity) {
      mainActivity.$['android:launchMode'] = 'singleTop';
    }
    return config;
  });
};
