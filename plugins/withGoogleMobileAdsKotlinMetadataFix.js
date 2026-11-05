const { withProjectBuildGradle } = require('expo/config-plugins');

const MARKER = 'withGoogleMobileAdsKotlinMetadataFix';

/**
 * react-native-google-mobile-ads 16.4+ depends on play-services-ads 25.4.0, whose classes carry
 * Kotlin 2.3 metadata. React Native 0.85 builds with Kotlin 2.1.20, which can read metadata only
 * up to 2.2, so :react-native-google-mobile-ads:compile*Kotlin fails. That module only calls the
 * ads SDK's Java API, so we skip the metadata version check for that one module. This is the same
 * fix react-native-google-mobile-ads ships itself from 17.0.0; remove this plugin when upgrading
 * to 17+ or once the app builds with Kotlin 2.2 or newer.
 */
const SNIPPET = `
// @generated begin ${MARKER} - expo prebuild (DO NOT MODIFY)
subprojects { subproject ->
  if (subproject.name == "react-native-google-mobile-ads") {
    subproject.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
      compilerOptions.freeCompilerArgs.add("-Xskip-metadata-version-check")
    }
  }
}
// @generated end ${MARKER}
`;

module.exports = function withGoogleMobileAdsKotlinMetadataFix(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error(`${MARKER}: expected a Groovy android/build.gradle`);
    }
    if (!config.modResults.contents.includes(MARKER)) {
      config.modResults.contents += SNIPPET;
    }
    return config;
  });
};
