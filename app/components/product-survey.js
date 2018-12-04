import Component from '@ember/component';
import $ from 'jquery';
import { get, set } from '@ember/object';
import { run } from '@ember/runloop';
import { inject } from '@ember/service';

export default Component.extend({
  model:null,
  scale:1,
  left:20,
  backDisabled: null,
  forwardDisabled: null,
  currentSlide:0,
  landingQuestion: 'list_12110962',
  landingQuestionObj: null,
  slider1: null,
  slider2: null,
  slide_1 : ['list_12111610','list_12111777', 'list_12110966', 'list_12110967'],
  slide_2 : ['list_12110968','list_13907264', 'list_12111854'],
  slide_3 : ['list_12110972','list_13913438', 'list_12110969'],
  slide_4 : ['list_12110970','list_12110971'],
  slide_5 : ['list_12110965','list_12111717'],
  slide_6 : ['list_12111755','date_22039590','textarea_12110979'],
  masterSlide : Array(),
  isLandingAnswered:false,
  userService: inject('user-journey-service'),

  init(){
    this._super(...arguments);
    for(var x =1;x<=6;x++){
      var tempArr = [];
      var tempSlide = 'slide_'+x;
      this[tempSlide].forEach(
        slide=>{
          tempArr.push(
            this.model.questionnaire.questions.find(
              question => question.identifier === slide
            )
          );
        });
      this.masterSlide.push(tempArr);
    }
    set(this, 'landingQuestionObj', this.model.questionnaire.questions.find(
      question => question.identifier === get(this, 'landingQuestion')
    ));
    set(this,'backDisabled',true);
  },
  didReceiveAttrs(){
    this._super(...arguments);
  },

  didRender() {
    $('.flip-block').css('visibility','hidden');
    $('.product-action-item').css('visibility','hidden');
    $('.product-story').css('visibility','hidden');
    var pages = $('.flip-page');
    pages.each(
      (i, page) =>{
        pages[i].classList.add('page'+i);
        if($(window).width()>560){
          if(i==0){
            pages[i].classList.add('current-page');
            $('.page'+i).css({'left':'0px',"z-index":(pages.length-i),"transform":"scale("+this.scale+")","opacity":1});
          }else {
            $('.page'+i).css({'left':''+i*this.left+'px',"z-index":''+(pages.length-i)+'',"opacity":1-(0.2*i),"transform":"scale("+(this.scale-parseFloat(0.05*i))+")"});
          }
        }else{
          if(i==0){
            pages[i].classList.add('current-page');
            $('.page'+i).css({"z-index":(pages.length-i),"transform":"scale("+this.scale+")","opacity":1});
          }else {
            $('.page'+i).css({"z-index":''+(pages.length-i)+'',"opacity":1-(0.2*i),"transform":"scale(0)"});
          }
        }
      }
    );
    $('#date_22039590').css('display','none');
    $('.gt-4-img')[2].classList.remove('wave');
    $('.list_12110962_0_drop').css('display','block');
    $('.list_12110962_1_drop').css('display','none');
    $('.list_12110962_2_drop').css('display','none');
    $('.list_12110962_3_drop').css('display','none');
    $('.list_12110962_4_drop').css('display','none');
    $('.list_12111610_0_drop').css({'display':'none'});
    $('.list_12111777_0_drop').css('display','none');
    $('.list_12111777_1_drop').css('display','none');
    $('.list_12110966_1_drop').css('display','none');
    $('.list_12110968_0_drop').css('display','none');
    $('.list_12110968_1_drop').css('display','none');
    $('.list_12110968_2_drop').css('display','none');
    $('.list_13907264_0_drop').css('display','none');
    $('.list_13907264_1_drop').css('display','none');
    $('.list_13907264_2_drop').css('display','none');
    $('.list_12110967_0_drop').css('display','none');
    $('.umbrella').css('display','none');
    $('.aeroplane').css('display','none');
    console.log('window width :  '+$(window).width());
  },

 actions:{
   next(){
     if(this.currentSlide<this.masterSlide.length-1){
       set(this, 'currentSlide', get(this, 'currentSlide')+1);
       this.forward($('.flip-page'));
     }else{
       //TODO showError();
     }
   },

   previous(){
     if(this.currentSlide>0){
       set(this, 'currentSlide', get(this, 'currentSlide')-1);
       this.reverse($('.flip-page'));
     }else if(this.currentSlide==0){
       $('.product-action-item').css('visibility','hidden');
       set(this, 'isLandingAnswered', false);
       $('.flip-block').css('visibility','hidden');
       $('.product-story').css('visibility','hidden');
       $('.landing-question').css('display','block');
       run.later(this, function() {
         $('html, body').animate({scrollTop: '0px'}, 800);
       }, 2000);
     }else{
       //TODO showError();
     }
   },

   select(question){
    console.log(question);
   },
   selection (question, currentSlide, $event){
     if(question.identifier === get(this, 'landingQuestion')){
       $('.flip-block').css('visibility','visible');
       $('.product-action-item').css('visibility','visible');
       $('.landing-question').css('display','none');
       $('.product-story').css('visibility','visible');
       run.later(this, function() {
         $('html, body').animate({scrollTop: '+=100px'}, 800);
       }, 2000);
       set(this, 'isLandingAnswered', true)
     }
     this.userService.setAnswerObject(question.identifier, $event.target.value);
     if(question.jumps.length>0){
       question.jumps.forEach(
         jump => {
           jump.conditions.forEach(
             condition => {
               if($event.target.value === condition.value){
                 $('#'+jump.destination.id).css('display','none')
               }else{
                 $('#'+jump.destination.id).css('display','block')
               }
             }
           )
         }
       )
     }
     this.addImageToStory(question.identifier+'_'+question.choices.findIndex(x=>x.label===$event.target.value));
   },
 },


  forward(x){
    var center = x.length;
    if($(window).width()>560){
      for(var y = 0; y<x.length;y++){
        if(x[y].classList.contains('current-page')){
          center = y;
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s','left':''+this.computeValue($('.page'+y).css('left'))-parseFloat(this.left)+'px',"z-index":$('.page'+y).css('z-index')-1,"transform":this.matrixFnBack($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))-0.2)});
          x[y].classList.remove('current-page');
        }else if(y<center){
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s','left':''+this.computeValue($('.page'+y).css('left'))-parseFloat(this.left)+'px',"z-index":$('.page'+y).css('z-index')-1,"transform":this.matrixFnBack($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))-0.2)});
        }else{
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s','left':''+this.computeValue($('.page'+y).css('left'))-parseFloat(this.left)+'px',"z-index":parseInt($('.page'+y).css('z-index'))+1,"transform":this.matrixFnForwrd($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))+0.2)});
        }
      }
    }else{
      for(var y = 0; y<x.length;y++){
        if(x[y].classList.contains('current-page')){
          center = y;
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s',"z-index":$('.page'+y).css('z-index')-1,"transform":this.matrixFnBack($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))-0.2)});
          x[y].classList.remove('current-page');
        }else if(y<center){
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s',"z-index":$('.page'+y).css('z-index')-1,"transform":this.matrixFnBack($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))-0.2)});
        }else{
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s',"z-index":parseInt($('.page'+y).css('z-index'))+1,"transform":this.matrixFnForwrd($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))+0.2)});
        }
      }
    }

    x[++center].classList.add('current-page');
  },

  reverse(x){
    var center = x.length;
    if($(window).width()>560){
      for(var y = 0; y<x.length;y++){
        if(x[y].classList.contains('current-page')){
          center = y;
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s','left':''+(this.computeValue($('.page'+y).css('left'))+parseFloat(this.left))+'px',"z-index":parseInt($('.page'+y).css('z-index'))-1,"transform":this.matrixFnBack($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))-0.2)});
          x[y].classList.remove('current-page');
        }else if(y<center){
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s','left':''+(this.computeValue($('.page'+y).css('left'))+parseFloat(this.left))+'px',"z-index":parseInt($('.page'+y).css('z-index'))+1,"transform":this.matrixFnForwrd($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))+0.2)});
        }else{
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s','left':''+(this.computeValue($('.page'+y).css('left'))+parseFloat(this.left))+'px',"z-index":parseInt($('.page'+y).css('z-index'))-1,"transform":this.matrixFnBack($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))-0.2)});
        }
      }
    }else{
      for(var y = 0; y<x.length;y++){
        if(x[y].classList.contains('current-page')){
          center = y;
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s',"z-index":parseInt($('.page'+y).css('z-index'))-1,"transform":this.matrixFnBack($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))-0.2)});
          x[y].classList.remove('current-page');
        }else if(y<center){
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s',"z-index":parseInt($('.page'+y).css('z-index'))+1,"transform":this.matrixFnForwrd($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))+0.2)});
        }else{
          $('.page'+y).css({'transition-timing-function' : 'ease-in','transition':'2s',"z-index":parseInt($('.page'+y).css('z-index'))-1,"transform":this.matrixFnBack($('.page'+y).css('transform')),"opacity":(parseFloat($('.page'+y).css('opacity'))-0.2)});
        }
      }
    }

    x[--center].classList.add('current-page');
  },


  goToSlide(x){
  },

  matrixFnForwrd(matrix){
    if($(window).width()>560) {
      var matArray = matrix.replace(/[^0-9\-.,]/g, '').split(',');
      return "matrix(" + (parseFloat(matArray[0]) + 0.05) + ",0,0," + (parseFloat(matArray[0]) + 0.05) + ",0,0)";
    }else{
      return "matrix(1,0,0,1,0,0)";
    }
  },

  matrixFnBack(matrix){
    if($(window).width()>560) {
      var matArray = matrix.replace(/[^0-9\-.,]/g, '').split(',');
      return "matrix(" + (parseFloat(matArray[0] - 0.05)) + ",0,0," + (parseFloat(matArray[0] - 0.05)) + ",0,0)";
    } else {
      return "matrix(1,0,0,1,0,0)";
    }
  },
  computeValue(value){
    var x = value.split('p');
    return parseInt(x[0]);
  },

  addImageToStory(className){
    switch(className){
      case 'list_12110962_0':
        $('.list_12110962_0_drop').css('display','block');
        $('.list_12110962_1_drop').css('display','none');
        $('.list_12110962_2_drop').css('display','none');
        $('.list_12110962_3_drop').css('display','none');
        $('.list_12110962_4_drop').css('display','none');
        break;
      case 'list_12110962_1':
        $('.list_12110962_0_drop').css('display','none');
        $('.list_12110962_1_drop').css('display','block');
        $('.list_12110962_2_drop').css('display','none');
        $('.list_12110962_3_drop').css('display','none');
        $('.list_12110962_4_drop').css('display','none');
        break;
      case 'list_12110962_2':
        $('.list_12110962_0_drop').css('display','none');
        $('.list_12110962_1_drop').css('display','none');
        $('.list_12110962_2_drop').css('display','block');
        $('.list_12110962_3_drop').css('display','none');
        $('.list_12110962_4_drop').css('display','none');
        break;
      case 'list_12110962_3':
        $('.list_12110962_0_drop').css('display','none');
        $('.list_12110962_1_drop').css('display','none');
        $('.list_12110962_2_drop').css('display','none');
        $('.list_12110962_3_drop').css('display','block');
        $('.list_12110962_4_drop').css('display','none');
        break;
      case 'list_12110962_4':
        $('.list_12110962_0_drop').css('display','none');
        $('.list_12110962_1_drop').css('display','none');
        $('.list_12110962_2_drop').css('display','none');
        $('.list_12110962_3_drop').css('display','none');
        $('.list_12110962_4_drop').css('display','block');
        break;
      case 'list_12111610_0':
          $('.list_12111610_0_drop').css({'display':'block'});
        break;
      case 'list_12111610_1':
        $('.list_12111610_0_drop').css({'display':'none'});
        break;
      case 'list_12111777_0':
        $('.list_12111777_0_drop').css('display','block');
        $('.list_12111777_1_drop').css('display','none');
        break;
      case 'list_12111777_1':
        $('.list_12111777_0_drop').css('display','none');
        $('.list_12111777_1_drop').css('display','block');
        break;
      case 'list_12110966_1':
        $('.list_12110966_1_drop').css('display','block');
        break;
      case 'list_12110966_0':
        $('.list_12110966_1_drop').css('display','none');
        break;
      case 'list_12110967_0':
        $('.list_12110967_0_drop').css('display','block');
        break;
      case 'list_12110967_1':
        $('.list_12110967_0_drop').css('display','none');
        break;
      case 'list_12110968_0':
        $('.list_12110968_0_drop').css('display','block');
        $('.list_12110968_1_drop').css('display','none');
        $('.list_12110968_2_drop').css('display','none');
        break;
      case 'list_12110968_1':
        $('.list_12110968_0_drop').css('display','none');
        $('.list_12110968_1_drop').css('display','block');
        $('.list_12110968_2_drop').css('display','none');
        break;
      case 'list_12110968_2':
        $('.list_12110968_0_drop').css('display','none');
        $('.list_12110968_1_drop').css('display','none');
        $('.list_12110968_2_drop').css('display','block');
        break;
      case 'list_12110968_3':
        $('.list_12110968_0_drop').css('display','none');
        $('.list_12110968_1_drop').css('display','none');
        $('.list_12110968_2_drop').css('display','none');
        break;
      case 'list_13907264_0':
        $('.list_13907264_0_drop').css('display','block');
        $('.list_13907264_1_drop').css('display','none');
        $('.list_13907264_2_drop').css('display','none');
        break;
      case 'list_13907264_1':
        $('.list_13907264_0_drop').css('display','none');
        $('.list_13907264_1_drop').css('display','block');
        $('.list_13907264_2_drop').css('display','none');
        break;
      case 'list_13907264_2':
        $('.list_13907264_0_drop').css('display','none');
        $('.list_13907264_1_drop').css('display','none');
        $('.list_13907264_2_drop').css('display','block');
        break;
      case 'list_13907264_3':
        $('.list_13907264_0_drop').css('display','none');
        $('.list_13907264_1_drop').css('display','none');
        $('.list_13907264_2_drop').css('display','none');
        break;
      case 'list_12110969_0':
        $('.aeroplane').css('display','block');
        break;
      case 'list_12110969_1':
        $('.aeroplane').css('display','block');
        break;
      case 'list_12110969_2':
        $('.aeroplane').css('display','none');
        break;
      case 'list_12111717_0':
        $('.umbrella').css('display','block');
        break;
      case 'list_12111717_1':
        $('.umbrella').css('display','none');
        break;

    }

  }
});
