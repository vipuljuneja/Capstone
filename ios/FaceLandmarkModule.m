//
//  FaceLandmarkModule.m
//  FaceDetectorApp
//
//  Created by Sukhbir on 28/09/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(FaceLandmarkModule, NSObject)

RCT_EXTERN_METHOD(processImage:(NSString *)imagePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
