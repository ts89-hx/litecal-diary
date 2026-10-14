// Explicit integration check: real local model + temporary DB user, cleaned in finally.
require('dotenv').config();
process.env.RECOGNITION_PROVIDER='local';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const jwt=require('jsonwebtoken');
const {User,DietRecord}=require('../models');
const sequelize=require('../config/database');
const app=require('../app');
const provider=require('../services/recognition/localProvider');
const root=path.resolve(__dirname,'..');
async function main(){
  let server,user;
  const report={testedAt:new Date().toISOString(),scope:'Three-photo smoke test including a known difficult image, not an accuracy benchmark',photos:[]};
  try{
    await sequelize.authenticate();
    user=await User.create({username:'food-smoke-'+Date.now(),password:''});
    const token=jwt.sign({userId:user.id},process.env.JWT_SECRET||'litecal-demo-secret',{expiresIn:'10m'});
    server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
    const base='http://127.0.0.1:'+server.address().port;
    async function request(route,options={}){
      const response=await fetch(base+route,{...options,headers:{Authorization:'Bearer '+token,...options.headers}});
      return {status:response.status,...await response.json()};
    }
    const started=Date.now();await provider.start();report.coldStartMs=Date.now()-started;
    console.log('Local model ready in '+report.coldStartMs+' ms');
    let tomato;
    for(const [file,expected] of [['tomato-eggs.jpg','番茄炒蛋'],['kung-pao.jpg','宫保鸡丁'],['tomato-eggs-clear.jpg','番茄炒蛋']]){
      const form=new FormData();form.append('image',new Blob([fs.readFileSync(path.join(root,'tests/fixtures',file))],{type:'image/jpeg'}),file);
      const before=Date.now();const response=await request('/recognition/food',{method:'POST',body:form});
      assert.equal(response.status,200,response.msg);
      const candidates=response.data.candidates;
      const result={file,elapsedMs:Date.now()-before,candidates:candidates.map(x=>({name:x.name,caloriesPer100g:x.caloriesPer100g,referencePortionG:x.referencePortionG})),expectedInCandidates:candidates.some(x=>x.name.includes(expected))};
      report.photos.push(result);console.log(JSON.stringify(result));
      // Persist incorrect predictions instead of hiding them or calling this an accuracy test.
      assert.ok(candidates.every(x=>x.provider==='local'&&x.foodId&&x.nutritionMatched));
      if(expected==='番茄炒蛋'&&result.expectedInCandidates)tomato=candidates.find(x=>x.name===expected);
    }
    report.top1Matches=report.photos.filter(x=>x.candidates[0].name.includes(x.file==='kung-pao.jpg'?'宫保鸡丁':'番茄炒蛋')).length;
    if(!tomato){
      const lookup=await request('/catalog/foods?query='+encodeURIComponent('番茄炒蛋'));
      const food=lookup.data.find(x=>x.name==='番茄炒蛋');assert.ok(food);
      tomato={foodId:food.id,name:food.name,referencePortionG:food.default_portion_g,caloriesPer100g:food.calories};
      report.portionFoodManuallySelected=true;
    }
    const invalid=new FormData();invalid.append('image',new Blob(['not an image'],{type:'image/jpeg'}),'bad.jpg');
    assert.notEqual((await request('/recognition/food',{method:'POST',body:invalid})).status,200);
    const json=body=>({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const saved=await request('/diet-records',json({foodId:tomato.foodId,foodName:tomato.name,mealType:'lunch',platePortionG:tomato.referencePortionG,consumedPercent:50,portionBasis:'reference',caloriesPer100g:999,source:'local'}));
    assert.equal(saved.status,200,saved.msg);
    const expectedGrams=tomato.referencePortionG/2;
    assert.equal(Number(saved.data.portion_g),expectedGrams);
    assert.equal(saved.data.calories,Math.round(tomato.caloriesPer100g*expectedGrams/100));
    assert.ok(saved.data.nutrition_snapshot.evidence);
    const edited=await request('/diet-records/'+saved.data.id,{...json({platePortionG:200,consumedPercent:50}),method:'PATCH'});
    assert.equal(edited.status,200,edited.msg);assert.equal(Number(edited.data.portion_g),100);
    assert.equal(edited.data.calories,Math.round(tomato.caloriesPer100g));
    const list=await request('/diet-records');assert.equal(list.data.length,1);assert.equal(Number(list.data[0].portion_g),100);
    report.portionFlow={food:tomato.name,referenceGrams:tomato.referencePortionG,referenceCalories:Math.round(tomato.referencePortionG*tomato.caloriesPer100g/100),halfGrams:expectedGrams,halfCalories:saved.data.calories,editedEatenGrams:100,editedCalories:edited.data.calories};
    report.invalidImageRejected=true;report.databaseFlowPassed=true;
    fs.writeFileSync(path.join(root,'data/nutrition/recognition-smoke-report.json'),JSON.stringify(report,null,2)+'\n');
    console.log('API and database flow passed; photo matches: '+report.top1Matches+'/'+report.photos.length+'. See report for misclassifications.');
  }finally{
    provider.stop();
    if(server)await new Promise(resolve=>server.close(resolve));
    if(user){await DietRecord.destroy({where:{user_id:user.id}});await user.destroy();}
    await sequelize.close();
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
