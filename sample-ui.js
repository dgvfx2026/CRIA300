/* Verbatim catalog samples: native dialog with a static HTML fallback. */
(() => {
  const dialog=document.getElementById('sample-dialog');
  const shell=dialog?.querySelector('.sample-shell');
  let trigger=null;
  let closing=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const changed=()=>document.dispatchEvent(new Event('cria:modal-change'));
  function enableCopy(scope){scope.querySelectorAll('.sample-copy').forEach(button=>{button.hidden=false;});}
  enableCopy(document);
  async function closeSample(){
    if(!dialog?.open||closing)return;
    closing=true;
    if(!reduced.matches&&shell.animate){
      await shell.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(24px) scale(.95)'}],{duration:190,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{});
    }
    dialog.close();
  }
  if(dialog&&typeof dialog.showModal==='function'){
    document.querySelectorAll('a[data-sample]').forEach(link=>link.addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      const template=document.getElementById('sample-'+link.dataset.sample);
      if(!template)return;
      event.preventDefault();trigger=link;closing=false;
      shell.getAnimations().forEach(animation=>animation.cancel());
      const content=dialog.querySelector('.sample-content');
      content.replaceChildren(template.content.cloneNode(true));enableCopy(content);
      dialog.showModal();shell.scrollTop=0;
      document.body.classList.add('modal-is-open');changed();
      document.getElementById('sample-close').focus({preventScroll:true});
    }));
    document.getElementById('sample-close').addEventListener('click',closeSample);
    dialog.addEventListener('keydown',event=>{
      if(event.key!=='Tab')return;
      const items=Array.from(dialog.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')).filter(node=>!node.closest('[hidden]')&&node.getClientRects().length);
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
    dialog.addEventListener('cancel',event=>{event.preventDefault();closeSample();});
    dialog.addEventListener('click',event=>{if(event.target===dialog)closeSample();});
    dialog.addEventListener('close',()=>{
      closing=false;
      if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-is-open');
      changed();
      if(trigger?.isConnected)trigger.focus({preventScroll:true});
    });
  }
  document.addEventListener('click',async event=>{
    const button=event.target instanceof Element?event.target.closest('.sample-copy'):null;
    if(!button||button.disabled)return;
    const scope=button.closest('.sample-content,.standalone-sample');
    const prompt=scope.querySelector('.sample-prompt');
    const status=scope.querySelector('.sample-copy-status');
    button.disabled=true;
    try{
      if(!navigator.clipboard)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(prompt.textContent);
      status.textContent='Prompt copiado. Cole na sua ferramenta de vídeo com IA.';
    }catch{
      status.textContent='Selecione o texto do prompt e copie com o comando do seu dispositivo.';
      const range=document.createRange();range.selectNodeContents(prompt);
      const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
      prompt.focus({preventScroll:true});
    }finally{button.disabled=false;}
  });
})();
