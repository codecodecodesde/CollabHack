import { Component, OnInit } from '@angular/core';

declare var ace: any;//typescript requires defined type for object

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  languages: string[] = ['Java', 'Python'];
  language: string = 'Java';

  editor: any;

  defaultContent = {
    'Java': `public class Solution {
      public static void main(String[] args){

      }
    }`,
    'Python': `class Solution:
    def example():`
  };

  constructor() { }

  ngOnInit() {
    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/eclipse");

    this.resetEditor();
  }

  //reset editor
  resetEditor(): void {
    this.editor.setValue(this.defaultContent[this.language]);
    this.editor.getSession().setMode("ace/mode/" + this.language.toLowerCase());
  }

  //set languages
  setLanguage(language: string): void {
    this.language = language;
    this.resetEditor();
  }

  submit(): void {
    let user_code = this.editor.getValue();
    console.log(user_code);
  }

}
