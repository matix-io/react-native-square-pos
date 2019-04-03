import { NativeModules, DeviceEventEmitter, Platform, Linking } from 'react-native'
const SquarePOS = NativeModules.RNSquarePos

let callbackUrl

const errors = {
	CANNOT_OPEN_SQUARE: 'CANNOT_OPEN_SQUARE',
	UNKNOWN_IOS_ERROR: 'UNKNOWN_IOS_ERROR',
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
				SquarePOS.startTransaction(amount, currency, options)

				function handleResponse(data) {
					DeviceEventEmitter.removeListener('RNSquarePOSResponse', handleResponse);
					if (data.errorCode) {
						return reject(data)
					} else {
						return resolve(data)
					}
				}

				DeviceEventEmitter.addListener('RNSquarePOSReponse', handleResponse);
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
							return reject({
								errorCode: data.error_code.toUpperCase()
							})
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
