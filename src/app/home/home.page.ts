import { SharedService } from "./../shared/shared.service";
import { Component } from "@angular/core";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { File } from "@ionic-native/file/ngx";
import { ActionSheetController } from "@ionic/angular";
import { Crop } from "@ionic-native/crop/ngx";
import { LoadingController } from "@ionic/angular";
import {
  DocumentScanner,
  DocumentScannerOptions
} from "@ionic-native/document-scanner/ngx";
declare var scan;

function makeblob(b64Data, contentType, sliceSize = 512) {
  contentType = contentType || "";
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage {
  semester = "";
  exam = "";
  section = "";
  base64Image = "";
  isLoading = false;
  image = "";
  idNumber = "";
  courseCode = "";
  obtainedMarks = "";

  constructor(
    private statusBar: StatusBar,
    private camera: Camera,
    public actionSheetController: ActionSheetController,
    private file: File,
    private crop: Crop,
    private sharedService: SharedService,
    private scanner: DocumentScanner,
    public loadingCtrl: LoadingController
  ) {
    // this.statusBar.overlaysWebView(false);
    // this.statusBar.backgroundColorByName('transparent');
    this.statusBar.styleBlackOpaque();
    //  this.extractIdnumber();
  }

  pickImage(sourceType) {
    const options: CameraOptions = {
      quality: 50,
      sourceType: sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    };
    this.camera.getPicture(options).then(
      imageData => {
        this.base64Image = "data:image/jpeg;base64," + imageData;
        this.image = imageData;
        this.onSubmit();
      },
      err => {
        // Handle error
      }
    );
  }

  scanDocument() {
    let opts: DocumentScannerOptions = {
      sourceType: 1,
      fileName: "myfilename",
      quality: 1.0,
      returnBase64: true
    };
    this.scanner
      .scanDoc(opts)
      .then((res: string) => console.log(res))
      .catch((error: any) => console.error(error));
    function successCallback(imageData) {
      alert(imageData);
      console.log(imageData);
      //image.src = "data:image/jpeg;base64," + imageData; // Base64 rendering
    }
    function errorCallback(message) {
      alert("Failed because: " + message);
    }
  }

  async selectImage() {
    this.setSession();
    this.obtainedMarks = "";
    this.idNumber = "";
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [
        {
          text: "Load from Library",
          handler: () => {
            this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: "Use Camera",
          handler: () => {
            this.pickImage(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: "Scan Document",
          handler: () => {
            this.scanDocument();
          }
        },
        {
          text: "Cancel",
          role: "cancel"
        }
      ]
    });
    await actionSheet.present();
  }

  setSession() {
    console.log(this.exam);
    this.sharedService.setSession(this.semester, this.exam, this.section);
  }

  onSubmit() {
    this.loadingCtrl
      .create({
        message: "Image is being processing..."
      })
      .then(loadingEl => {
        loadingEl.present();
        console.log(makeblob(this.image, "image/jpeg"));
        console.log(this.image);
        this.sharedService
          .post(makeblob(this.image, "image/jpeg"), "application/octet-stream")
          .subscribe(
            (res: any) => {
              if (res.status === 202) {
                this.sharedService
                  .get(res.headers.get("Operation-Location"))
                  .subscribe((data: any) => {
                    console.log(data);
                    loadingEl.dismiss();
                    // this.extractIdnumber(data.body.recognitionResults[0].lines);
                    // this.extractObtainMarks(
                    //   data.body.recognitionResults[0].lines
                    // );
                  });
              }
            },
            error => {
              loadingEl.dismiss();
              console.log(error);
            }
          );
       });
  }

  extractIdnumber(data: any) {
    let temp: any;
    let regx = /(\d+.*\d*.*)-(.*\d+.*\d*.*)-(.*\d+.*\d*)/g;
    for (let item of data) {
      //  if(item[])
      //  console.log(item);
      if (regx.test(item.text)) {
        console.log(item);
        let temp = item.text.replace(/\./g, "");
        temp = temp.replace(/\!/g, "1");
        this.idNumber = temp.replace(/[^\d+\d-\d+-\d+]/g, "");
        console.log(this.idNumber);
        break;
      }
    }
  }

  extractObtainMarks(data: any) {
    let flag = 0;
    let regx = /\d+\.?\d+/g;
    for (let item of data) {
      if (regx.test(item.text) && flag > 0) {
        let temp = item.text.match(regx);
        if (flag > 1) {
          this.obtainedMarks = item.text.match(regx);
          break;
        } else {
          flag++;
        }
      }
      if (item.text == "Total") {
        flag++;
      }
    }
  }
}
