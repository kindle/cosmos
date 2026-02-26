import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleGenerativeAI } from "@google/generative-ai"

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  sky(){
    this.router.navigate(['/sky'], {
      queryParams: {
      }
    });
  }

  zodiac(){
    this.router.navigate(['/zodiac'], {
      queryParams: {
      }
    });
  }

  earth(){
    this.router.navigate(['/earth'], {
      queryParams: {
      }
    });
  }

  constructor(private router: Router) {
    this.run();
  }

  async run() {
    //const { GoogleGenerativeAI } = require("@google/generative-ai");

    // Access your API key as an environment variable (see "Set up your API key" above)
    let key = "AIzaSyCL1sWW2QLLGf8n4ipkv_cZIr-mB76mOyM";
    const genAI = new GoogleGenerativeAI(key);

    // ...

    //const model = genAI.getGenerativeModel({ model: "MODEL_NAME"});

    // ...
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  
    const prompt = "Write a email to 汤慧芳, the content is as below: I want to have a meeting with you Tue morning 10:00AM, talking about the code style and system design"
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  }
  

}
