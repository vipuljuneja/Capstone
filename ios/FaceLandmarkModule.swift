import Foundation
import MediaPipeTasksVision
import UIKit

@objc(FaceLandmarkModule)
class FaceLandmarkModule: NSObject {
  
  private var faceLandmarker: FaceLandmarker?
  
  override init() {
    super.init()
    setupFaceLandmarker()
  }
  
  private func setupFaceLandmarker() {
    guard let modelPath = Bundle.main.path(forResource: "face_landmarker", ofType: "task") else {
      print("Model file not found")
      return
    }
    
    let options = FaceLandmarkerOptions()
    options.baseOptions.modelAssetPath = modelPath
    options.runningMode = .image
    options.numFaces = 1
    options.outputFaceBlendshapes = true
    options.outputFacialTransformationMatrixes = true
    
    do {
      faceLandmarker = try FaceLandmarker(options: options)
      print("Face Landmarker initialized")
    } catch {
      print("Failed to initialize: \(error)")
    }
  }
  
  @objc
  func processImage(_ imagePath: String,
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    guard let faceLandmarker = faceLandmarker else {
      reject("NO_MODEL", "Face Landmarker not initialized", nil)
      return
    }
    
    let imageUrl = URL(fileURLWithPath: imagePath)
    guard let uiImage = UIImage(contentsOfFile: imageUrl.path) else {
      reject("NO_IMAGE", "Cannot load image", nil)
      return
    }
    
    guard let mpImage = try? MPImage(uiImage: uiImage) else {
      reject("MP_ERROR", "Cannot create MPImage", nil)
      return
    }
    
    do {
      let result = try faceLandmarker.detect(image: mpImage)
      
      var response: [String: Any] = [
        "faceCount": result.faceLandmarks.count
      ]
      
      if let firstFace = result.faceLandmarks.first {
        response["landmarkCount"] = firstFace.count
      }
      
      // Check if blendshapes exist
      if result.faceBlendshapes.count > 0,
         let firstFaceBlendshapes = result.faceBlendshapes.first {
        var blendshapeData: [[String: Any]] = []
        
        // Access the categories array from the Classifications object
        for category in firstFaceBlendshapes.categories {
          blendshapeData.append([
            "category": category.categoryName ?? "unknown",
            "score": category.score
          ])
        }
        
        response["blendshapes"] = blendshapeData
        response["blendshapeCount"] = blendshapeData.count
      }
      
      resolve(response)
      
    } catch {
      reject("DETECT_ERROR", "Detection failed: \(error.localizedDescription)", error)
    }
  }
  
}
