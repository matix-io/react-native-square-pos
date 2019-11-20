import { NativeModules, DeviceEventEmitter, Platform, Linking } from 'react-native'
const SquarePOS = NativeModules.RNSquarePos

let callbackUrl

const errors = {
	CANNOT_OPEN_SQUARE: 'CANNOT_OPEN_SQUARE',
	UNKNOWN_IOS_ERROR: 'UNKNOWN_IOS_ERROR',
	UNKNOWN_ANDROID_ERROR: 'UNKNOWN_ANDROID_ERROR',
	PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
	NOT_LOGGED_IN: 'NOT_LOGGED_IN',
	USER_NOT_ACTIVE: 'USER_NOT_ACTIVE',
	AMOUNT_TOO_SMALL: 'AMOUNT_TOO_SMALL',
	AMOUNT_TOO_LARGE: 'AMOUNT_TOO_LARGE',
	INVALID_TENDER_TYPE: 'INVALID_TENDER_TYPE',
	UNSUPPORTED_TENDER_TYPE: 'UNSUPPORTED_TENDER_TYPE',
	NO_NETWORK_CONNECTION: 'NO_NETWORK_CONNECTION',
	TRANSACTION_ALREADY_IN_PROGRESS: 'TRANSACTION_ALREADY_IN_PROGRESS',
  INVALID_REQUEST: 'INVALID_REQUEST',
}

const iosErrors = {
	payment_canceled: errors.PAYMENT_CANCELLED,
	not_logged_in: errors.NOT_LOGGED_IN,
	user_not_active: errors.USER_NOT_ACTIVE,
	amount_too_small: errors.AMOUNT_TOO_SMALL,
	amount_too_large: errors.AMOUNT_TOO_LARGE,
	invalid_tender_type: errors.INVALID_TENDER_TYPE,
	unsupported_tender_type: errors.UNSUPPORTED_TENDER_TYPE,
	no_network_connection: errors.NO_NETWORK_CONNECTION,
}

const androidErrors = {
	TRANSACTION_CANCELED: errors.PAYMENT_CANCELLED,
	USER_NOT_LOGGED_IN: errors.NOT_LOGGED_IN,
	USER_NOT_ACTIVATED: errors.USER_NOT_ACTIVE,
	NO_NETWORK: errors.NO_NETWORK_CONNECTION,
	TRANSACTION_ALREADY_IN_PROGRESS: errors.TRANSACTION_ALREADY_IN_PROGRESS, 
  INVALID_REQUEST: errors.INVALID_REQUEST,
}

const RNSquarePos = {
	ERRORS: errors,
	configure: (options) => {
		SquarePOS.setApplicationId(options.applicationId)
		callbackUrl = options.callbackUrl
	},
	transaction: (amount, currency, options = {}) => {
		return new Promise((resolve, reject) => {
			if (Platform.OS === 'android') {
				SquarePOS.startTransaction(amount, currency, options, () => {
					return reject({
						errorCode: errors.CANNOT_OPEN_SQUARE
					})
				})

				function handleResponse(data) {
					DeviceEventEmitter.removeListener('RNSquarePOSResponse', handleResponse);
					if (data.errorCode) {
						if (androidErrors[data.errorCode]) {
							return reject({
								errorCode: androidErrors[data.errorCode],
                squareResponse: data
							})
						} else {
							return reject({
								errorCode: errors.UNKNOWN_ANDROID_ERROR,
								originalCode: data.errorCode,
                squareResponse: data
							})
						}
					} else {
						return resolve(data)
					}
				}

				DeviceEventEmitter.addListener('RNSquarePOSResponse', handleResponse);
			} else if (Platform.OS === 'ios') {
				SquarePOS.startTransaction(amount, currency, options, callbackUrl, (errorCode, errorDescription) => {
					switch (errorCode) {
						case 6:
							reject({
								errorCode: errors.CANNOT_OPEN_SQUARE
							})
							break

						default:
							reject({
								errorCode: errors.UNKNOWN_IOS_ERROR,
								errorDescription
							})
							break
					}
				})

				function handleIOSResponse(event) {
					Linking.removeEventListener('url', handleIOSResponse);
					const url = event.url

					if (url.match(callbackUrl)) {
						const data = JSON.parse(decodeURIComponent(url.split('?data=')[1]))

						if (data.error_code) {
							if (iosErrors[data.error_code]) {
								return reject({
									errorCode: iosErrors[data.error_code]
								})
							} else {
								return reject({
									errorCode: errors.UNKNOWN_IOS_ERROR,
									originalCode: data.error_code
								})
							}
						} else {
							return resolve({
								transactionId: data.transaction_id,
								clientTransactionId: data.client_transaction_id
							})
						}
					}
				}

				Linking.addEventListener('url', handleIOSResponse);
			}
		})
	},
}

export default RNSquarePos;

