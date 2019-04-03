
#import "RNSquarePos.h"
#import <SquarePointOfSaleSDK/SquarePointOfSaleSDK.h>
#import <Foundation/Foundation.h>

@implementation RNSquarePos

NSString *applicationId;

RCT_EXPORT_METHOD(setApplicationId:(NSString *) _applicationId) {
    applicationId = _applicationId;
}

RCT_EXPORT_METHOD(
	startTransaction:(int)_amount 
	currency:(NSString *)currency 
	options:(NSDictionary *)options 
	callbackUrl:(NSString *)callbackUrl
) {
	NSError *error;
	NSURL *const callbackURL = [NSURL URLWithString:callbackUrl];
	SCCMoney *const amount = [SCCMoney moneyWithAmountCents:_amount currencyCode:currency error:NULL];
	[SCCAPIRequest setClientID:applicationId];

	// notes
	NSString *notes = nil;
	if ([options objectForKey:@"note"]) {
		notes = [options objectForKey:@"note"];
	}

	// tenderTypes
	SCCAPIRequestTenderTypes tenderTypes = nil;
	SCCAPIRequestTenderTypes currType;
	NSArray *_tenderTypes = nil;
	NSString *tenderType;
	if ([options objectForKey:@"tenderTypes"]) {
		_tenderTypes = [options objectForKey:@"tenderTypes"];
		for (int i = 0; i < [_tenderTypes count]; i++) {
			tenderType = [_tenderTypes objectAtIndex:i];
			currType = nil;
			if ([tenderType isEqualToString:@"CASH"]) {
				currType = SCCAPIRequestTenderTypeCash;
			} else if ([tenderType isEqualToString:@"CARD"]) {
				currType = SCCAPIRequestTenderTypeCard;
			} else if ([tenderType isEqualToString:@"CARD_ON_FILE"]) {
				currType = SCCAPIRequestTenderTypeCardOnFile;
			} else if ([tenderType isEqualToString:@"OTHER"]) {
				currType = SCCAPIRequestTenderTypeOther;
			}

			if (currType != nil) {
				if (tenderTypes == nil) {
					tenderTypes = currType;
				} else {
					tenderTypes = tenderTypes | currType;
				}
			}
		}
	}
	if (tenderTypes == nil) {
		tenderTypes = SCCAPIRequestTenderTypeAll;
	}

	// autoreturn
	BOOL autoReturn = NO;
	if ([options objectForKey:@"returnAutomaticallyAfterPayment"]) {
		autoReturn = [options objectForKey:@"returnAutomaticallyAfterPayment"];
	}

	SCCAPIRequest *request = [SCCAPIRequest requestWithCallbackURL:callbackURL
															amount:amount
													userInfoString:nil
														locationID:nil
													   		 notes:notes
														  customerID:nil
											  supportedTenderTypes:tenderTypes
												 clearsDefaultFees:NO
								   returnAutomaticallyAfterPayment:autoReturn
															 error:&error];
	[SCCAPIConnection performRequest:request error:&error];
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

@end
