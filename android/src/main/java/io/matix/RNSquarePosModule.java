
package io.matix;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.squareup.sdk.pos.PosClient;
import com.squareup.sdk.pos.PosSdk;
import com.squareup.sdk.pos.ChargeRequest;
import com.squareup.sdk.pos.CurrencyCode;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.app.Activity;
import java.util.concurrent.TimeUnit;


class RequestCode {
	public static int CHARGE = 1;
}


class SquarePOSListener implements ActivityEventListener {
	private ReactContext reactContext;
	private PosClient posClient;

	public SquarePOSListener(ReactContext reactContext, PosClient posClient) {
		this.reactContext = reactContext;
		this.posClient = posClient;
	}

	public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
		WritableMap params = Arguments.createMap();

		if (data == null || requestCode != RequestCode.CHARGE) {
			return;
		}

		if (resultCode == Activity.RESULT_OK) {
			ChargeRequest.Success success = this.posClient.parseChargeSuccess(data);
			params.putString("transactionId", success.serverTransactionId);
			params.putString("clientTransactionId", success.clientTransactionId);
		} else {
			ChargeRequest.Error error = this.posClient.parseChargeError(data);
			params.putString("debugDescription", error.debugDescription);
			params.putString("errorCode", error.code.toString());
			params.putString("response", error.debugDescription);
		}

		this.reactContext
			.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
			.emit("RNSquarePOSResponse", params);
	}

	public void onNewIntent(Intent intent) {

	}
}


public class RNSquarePosModule extends ReactContextBaseJavaModule {
	private ReactContext reactContext;
	private PosClient posClient;

	public RNSquarePosModule(ReactApplicationContext reactContext) {
		super(reactContext);
		this.reactContext = reactContext;
	}

	@Override
	public String getName() {
		return "RNSquarePos";
	}

	@ReactMethod
	public void setApplicationId(String applicationId) {
		this.posClient = PosSdk.createClient(this.reactContext, applicationId);
		this.reactContext.addActivityEventListener(new SquarePOSListener(this.reactContext, this.posClient));
	}

	@ReactMethod
	public void startTransaction(int amount, String currencyCode, ReadableMap data, Callback errorCallback) {
		CurrencyCode code = CurrencyCode.valueOf(currencyCode);

		ChargeRequest.Builder builder = new ChargeRequest.Builder(
			amount,
			code
		);

		if (data.hasKey("autoReturn")) {
			builder.autoReturn(data.getInt("autoReturn"), TimeUnit.MILLISECONDS);
		}

		if (data.hasKey("note")) {
			builder.note(data.getString("note"));
		}

		if (data.hasKey("tenderTypes")) {
			ReadableArray types = data.getArray("tenderTypes");
			ChargeRequest.TenderType tenderTypes[] = new ChargeRequest.TenderType[types.size()];
			for (int i = 0; i < types.size(); i += 1) {
				tenderTypes[i] = ChargeRequest.TenderType.valueOf(types.getString(i));
			}
			builder.restrictTendersTo(tenderTypes);
		}

		if (data.hasKey("locationId")) {
			builder.enforceBusinessLocation(data.getString("locationId"));
		}

		ChargeRequest request = builder.build();

		try {
			Intent intent = posClient.createChargeIntent(request);
			this.reactContext.getCurrentActivity().startActivityForResult(intent, RequestCode.CHARGE);
		} catch (ActivityNotFoundException e) {
			errorCallback.invoke(e.toString());
		}
	}
}
