export type Region = 'unknown' | 'right' | 'left';
export type Level = 'unknown' | 'upper' | 'middle' | 'lower';
export interface Tumour { id: string; size: string; region: Region; level: Level }
export interface CaseInput {
  pattern: 'unknown' | 'listed' | 'diffuse';
  coverage: 'unknown' | 'complete' | 'partial';
  tumours: Tumour[];
  liver: 'unknown' | 'preserved' | 'impaired';
  activity: 'unknown' | '0' | '1-2' | '3-4';
  invasion: 'unknown' | 'yes' | 'no';
  spread: 'unknown' | 'yes' | 'no';
}
export type ChoiceKey = 'liver' | 'activity' | 'invasion' | 'spread';
export const MAX_TUMOURS = 12;
export const blankCase: CaseInput = {pattern:'unknown',coverage:'unknown',tumours:[],liver:'unknown',activity:'unknown',invasion:'unknown',spread:'unknown'};
export const lesion = (id: string, size='', region: Region='unknown', level: Level='unknown'): Tumour => ({id,size,region,level});
export const cloneCase = (c: CaseInput): CaseInput => ({...c,tumours:c.tumours.map(t=>({...t}))});
export function addTumour(c: CaseInput): CaseInput {
  if(c.tumours.length>=MAX_TUMOURS) return c;
  const n=Math.max(0,...c.tumours.map(t=>Number(t.id.slice(1))||0))+1;
  return {...c,pattern:'listed',tumours:[...c.tumours,lesion(`T${n}`)]};
}
export function removeTumour(c: CaseInput,id: string): CaseInput {
  const tumours=c.tumours.filter(t=>t.id!==id);
  return {...c,tumours,pattern:tumours.length?c.pattern:'unknown',coverage:tumours.length?c.coverage:'unknown'};
}
export function selectedTumour(c: CaseInput,id: string|null): Tumour|null {
  return c.tumours.find(t=>t.id===id)??c.tumours[0]??null;
}
export function aggregate(c: CaseInput) {
  const known=c.tumours.filter(t=>t.size!=='').map(t=>Number(t.size));
  const complete=c.pattern==='listed'&&c.coverage==='complete'&&c.tumours.length>0;
  const largestKnown=known.length?Math.max(...known):null;
  return {
    count:c.pattern==='diffuse'?'diffuse' as const:!complete?'unknown' as const:c.tumours.length>=4?'4+' as const:String(c.tumours.length) as '1'|'2'|'3',
    // An unknown lesion size is never replaced by the maximum of the known ones.
    size:complete&&known.length===c.tumours.length?String(largestKnown):'',
    largestKnown, recorded:c.tumours.length, complete,
    region:c.tumours.some(t=>t.region==='unknown')?'unknown' as const:new Set(c.tumours.map(t=>t.region)).size>1?'both' as const:c.tumours[0]?.region??'unknown',
    liver:c.liver,activity:c.activity,invasion:c.invasion,spread:c.spread
  };
}
export function tumourPositions(tumours: Tumour[]) {
  // One shared linear diameter scale. Region/level are schematic, not imaging coordinates.
  const unit=Math.min(12,80/Math.max(1,...tumours.map(t=>Number(t.size)||0)));
  const groups: Record<string,number>={};
  return tumours.map((t,i)=>{
    const group=`${t.region}-${t.level}`; const index=groups[group]??0; groups[group]=index+1;
    const same=tumours.filter(x=>`${x.region}-${x.level}`===group).length;
    const row=t.level==='upper'?0:t.level==='lower'?2:1;
    const columns=Math.min(same,4), localRow=Math.floor(index/4);
    const centre=t.region==='left'?555:285;
    const span=t.region==='left'?150:210;
    const x=t.region==='unknown'?90+(i%8)*88:centre+(index%4-(columns-1)/2)*Math.min(52,span/Math.max(1,columns-1));
    const y=t.region==='unknown'?510+Math.floor(i/8)*45:(t.region==='left'?190+row*38:185+row*70)+(localRow-(Math.ceil(same/4)-1)/2)*28;
    return {...t,x,y,r:t.size===''?13:Math.max(.7,Number(t.size)*unit/2),placed:t.region!=='unknown'};
  });
}
