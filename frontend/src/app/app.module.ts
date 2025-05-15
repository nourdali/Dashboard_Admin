import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FileUploadComponent } from './component/file-upload/file-upload.component';
import { DocumentListComponent } from './component/document-list/document-list.component';
import { ChatComponent } from './component/chat/chat.component';
import { ModelCreationComponent } from './component/model-creation/model-creation.component';
import { ModelListComponent } from './component/model-list/model-list.component';
import { ModelDetailComponent } from './component/model-detail/model-detail.component';
import { SpinnerComponent } from './component/spinner/spinner.component';

// Services
import { ApiService } from './services/api.service';
import { WebSocketService } from './services/websocket.service';

@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    DocumentListComponent,
    ChatComponent,
    ModelCreationComponent,
    ModelListComponent,
    ModelDetailComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    ApiService,
    WebSocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }