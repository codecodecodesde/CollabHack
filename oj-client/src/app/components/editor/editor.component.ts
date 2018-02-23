import { Component, OnInit } from '@angular/core';
import {CollaborationService } from '../../services/collaboration.service';
import { ActivatedRoute, Params } from '@angular/router';

declare var ace: any;//typescript requires defined type for object

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  languages: string[] = ['Java', 'Python'];
  language: string = 'Java';

  sessionId: string;

  editor: any;

  defaultContent = {
      'Java': ` public class Solution {
        public static void main(String[] args){

        }
      }`,
      'Python': `class Solution:
      def example():`
  };

  constructor(private collaboration: CollaborationService,
              private route: ActivatedRoute) { }

  ngOnInit() {

    this.route.params
      .subscribe(params => {
        this.sessionId = params['id'];
        this.initEditor();
        this.collaboration.restoreBuffer();
      });
  }

  initEditor(): void {
    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/eclipse");
    this.resetEditor();

    //set up collaboration socket
    this.collaboration.init(this.editor, this.sessionId);

    this.editor.lastAppliedChange = null;
    //register change callback
    this.editor.on("change", (e) => {
      console.log('editor change: ' + JSON.stringify(e));
      if(this.editor.lastAppliedChange != e){
        this.collaboration.change(JSON.stringify(e));
      }
    });
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
