
# react-native-square-pos

**Big note, this is under development at the moment.  Give me a week and it'll be properly documented.*

## Getting started


### Installation

1. `npm install react-native-square-pos --save` or `yarn add react-native-square-pos`
2. `react-native link`

### iOS Installation

1. Add `RNSquarePos` to your Podfile: `pod 'RNSquarePos', :path => '../node_modules/react-native-square-pos'`, and run `pod install`
2. In the ["Getting Started" section from Square Docs](https://github.com/square/SquarePointOfSaleSDK-iOS/tree/fcb44143c9b199f62f9feb61e98a51516e0c28a3#update-your-infoplist), complete the following sections: "Update your Info.plist", and "Register your app with Square".  **Take note of the _URL Scheme_ and the _Application ID_**.
3. Make sure you've modified [`AppDelegate.m` to include `RCTLinking`](https://facebook.github.io/react-native/docs/linking).

### Android Installation

1. Follow ["Step 2: Register your application" in Square Android docs](https://docs.connect.squareup.com/payments/pos/setup-android#step-2-register-your-application). 
2. **Take note of your _Application ID_**  (this is found in the Square Developer dashboard, under "Credentials")


## Usage

Import the package

```javascript
import SquarePOS from 'react-native-square-pos'
```

Configure the package

```javascript
SquarePOS.configure({
  applicationId: 'Your Square application ID',
  callbackUrl: 'yourUrlScheme://some-unique-path'
})
```

Make a transaction

```javascript
const amountInCents = 100
const currency = 'CAD' // 🇨🇦
const options = {
  tenderTypes: [
    'CARD',
    'CARD_ON_FILE',
    'CASH',
    'OTHER'
  ],
  note: 'This note shows up on the transaction'
}
SquarePOS.transaction(amountInCents, currency, options)
  .then((result) => {
      // the transaction was successful
      const { transactionId, clientTransactionId } = result
  })
  .catch((err) => {
      // the transaction failed. 
      // see error codes below.
      const { errorCode } = err
  })
```

### Error Codes

There are a number of different error codes, which may differ on Android / iOS.  Eventually, an exhaustive list should be compiled here.  For now, here are the important ones:

- `NOT_LOGGED_IN`: The user isn't logged into a Square account
- `PAYMENT_CANCELLED`: The payment got cancelled from within the app
- `
// they may differ on iOS / Android.
// they should probably be listed here.
// maybe someday.


#### iOS error codes

```
NSString *__nonnull const SCCAPIErrorStringPaymentCanceled = @"payment_canceled";
NSString *__nonnull const SCCAPIErrorStringPayloadMissingOrInvalid = @"data_invalid";
NSString *__nonnull const SCCAPIErrorStringAppNotLoggedIn = @"not_logged_in";
NSString *__nonnull const SCCAPIErrorStringLocationIDMismatch = @"location_id_mismatch";
NSString *__nonnull const SCCAPIErrorStringUserNotActivated = @"user_not_active";
NSString *__nonnull const SCCAPIErrorStringCurrencyMissingOrInvalid = @"currency_code_missing";
NSString *__nonnull const SCCAPIErrorStringCurrencyUnsupported = @"unsupported_currency_code";
NSString *__nonnull const SCCAPIErrorStringCurrencyMismatch = @"currency_code_mismatch";
NSString *__nonnull const SCCAPIErrorStringAmountMissingOrInvalid = @"amount_invalid_format";
NSString *__nonnull const SCCAPIErrorStringAmountTooSmall = @"amount_too_small";
NSString *__nonnull const SCCAPIErrorStringAmountTooLarge = @"amount_too_large";
NSString *__nonnull const SCCAPIErrorStringInvalidTenderType = @"invalid_tender_type";
NSString *__nonnull const SCCAPIErrorStringUnsupportedTenderType = @"unsupported_tender_type";
NSString *__nonnull const SCCAPIErrorStringCouldNotPerform = @"could_not_perform";
NSString *__nonnull const SCCAPIErrorStringNoNetworkConnection = @"no_network_connection";
NSString *__nonnull const SCCAPIErrorStringUnsupportedAPIVersion = @"unsupported_api_version";
NSString *__nonnull const SCCAPIErrorStringInvalidVersionNumber = @"invalid_version_number";
NSString *__nonnull const SCCAPIErrorStringCustomerManagementNotSupported = @"customer_management_not_supported";
NSString *__nonnull const SCCAPIErrorStringInvalidCustomerID = @"invalid_customer_id";
```

#### Android error codes

```
/** The Point of Sale API is not currently available. */
DISABLED(PosApi.ERROR_DISABLED),

/** The merchant account does not support Customer Management. */
CUSTOMER_MANAGEMENT_NOT_SUPPORTED(PosApi.ERROR_CUSTOMER_MANAGEMENT_NOT_SUPPORTED),

/**
 * The Customer Id is invalid. This could happen if the account logged in to Square Point of
 * Sale is different from the account from which the customer information was downloaded.
 */
ERROR_INVALID_CUSTOMER_ID(PosApi.ERROR_INVALID_CUSTOMER_ID),

/** @deprecated Starting with SDK 1.1, Square Point of Sale supports Square Prepaid Gift Cards. */
@Deprecated GIFT_CARDS_NOT_SUPPORTED(PosApi.ERROR_GIFT_CARDS_NOT_SUPPORTED),

/**
 * The provided location ID does not correspond to the location currently logged in to Square
 * Point of Sale.
 */
ILLEGAL_LOCATION_ID(PosApi.ERROR_ILLEGAL_LOCATION_ID),

/**
 * @deprecated Starting with SDK 1.1, Square Point of Sale supports split tender transactions,
 * so
 * a transaction can be completed as a split tender if a card has insufficient balance.
 */
@Deprecated INSUFFICIENT_CARD_BALANCE(PosApi.ERROR_INSUFFICIENT_CARD_BALANCE),

/**
 * The information provided in the transaction request was invalid (a required field might have
 * been missing or malformed).
 *
 * {@link Error#debugDescription} provides additional details.
 */
INVALID_REQUEST(PosApi.ERROR_INVALID_REQUEST),

/** Employee management is enabled but no employee is logged in to Square Point of Sale. */
NO_EMPLOYEE_LOGGED_IN(PosApi.ERROR_NO_EMPLOYEE_LOGGED_IN),

/**
 * Square Point of Sale was unable to validate the Point of Sale API request because the Android
 * device did not have an active network connection.
 */
NO_NETWORK(PosApi.ERROR_NO_NETWORK),

/**
 * Square Point of Sale did not return a transaction result. In only this case, any value that
 * you provided in {@link Builder#requestMetadata(String)} will not be returned.
 */
NO_RESULT(PosApi.ERROR_NO_RESULT),

/**
 * Another Square Point of Sale transaction is already in progress. The merchant should open
 * Square Point of Sale to complete or cancel the current transaction before attempting to
 * initiate a new one.
 */
TRANSACTION_ALREADY_IN_PROGRESS(PosApi.ERROR_TRANSACTION_ALREADY_IN_PROGRESS),

/** The merchant canceled the transaction. */
TRANSACTION_CANCELED(PosApi.ERROR_TRANSACTION_CANCELED),

/**
 * @deprecated Starting with SDK 1.2, the OAuth authorization flow is no longer required for
 * Point of Sale API, and this error will never be returned.
 */
@Deprecated UNAUTHORIZED_CLIENT_ID(PosApi.ERROR_UNAUTHORIZED_CLIENT_ID),

/**
 * An unexpected error occurred. Please contact <a href="mailto:developers@squareup.com">developers@squareup.com</a>
 * and include any code snippets and descriptions of your use case that might help diagnose the
 * issue.
 */
UNEXPECTED(PosApi.ERROR_UNEXPECTED),

/**
 * The installed version of Square Point of Sale doesn't support this version of the Point of
 * Sale SDK.
 * This is probably because the installed version of Square Point of Sale is out of date.
 */
UNSUPPORTED_API_VERSION(PosApi.ERROR_UNSUPPORTED_API_VERSION),

/**
 * The merchant tried to process the transaction with a credit card, but the merchant's Square
 * account has not yet been activated for card processing.
 */
USER_NOT_ACTIVATED(PosApi.ERROR_USER_NOT_ACTIVATED),

/** No user is currently logged in to Square Point of Sale. */
USER_NOT_LOGGED_IN(PosApi.ERROR_USER_NOT_LOGGED_IN);
  ```