package org.app.hoozin;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.bugsnag.BugsnagReactNative;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.marianhello.bgloc.react.BackgroundGeolocationPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.RNTextInputMask.RNTextInputMaskPackage;
import io.rumors.reactnativesettings.RNSettingsPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.reactlibrary.googlesignin.RNGoogleSignInPackage;
import com.devfd.RNGeocoder.RNGeocoderPackage;
import com.rnfs.RNFSPackage;
import io.invertase.firebase.RNFirebasePackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import org.reactnative.camera.RNCameraPackage;
import com.krazylabs.OpenAppSettingsPackage;



import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;


import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.firestore.RNFirebaseFirestorePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.database.RNFirebaseDatabasePackage;
import io.invertase.firebase.storage.RNFirebaseStoragePackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;



import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            BugsnagReactNative.getPackage(),
            new RNGoogleSigninPackage(),
            new BackgroundGeolocationPackage(),          
            new VectorIconsPackage(),
            new RNTextInputMaskPackage(),
            new RNSettingsPackage(),
            new PickerPackage(),
            new RNI18nPackage(),
            new RNFirebasePackage(),
            new OpenAppSettingsPackage(),
            new RNFetchBlobPackage(),
            new RNFSPackage(),
            new RNCameraPackage(),
            new ReactNativeContacts(),
            new MapsPackage(),
            new FBSDKPackage(mCallbackManager),
            new RNGoogleSignInPackage(),
            new RNFirebaseAuthPackage(),
            new RNFirebaseFirestorePackage(),
            new RNFirebaseMessagingPackage(),
            new RNFirebaseDatabasePackage(),
            new RNFirebaseStoragePackage(),
            new RNFirebaseNotificationsPackage(),
            new RNGeocoderPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
