export type TreatmentId = 'surgery' | 'ablation' | 'artery' | 'medicines';
export type Status = 'discuss' | 'assess' | 'unknown' | 'not';
export interface CaseInput {
  count: 'unknown' | '1' | '2' | '3' | '4+' | 'diffuse';
  size: string;
  region: 'unknown' | 'right' | 'left' | 'both';
  liver: 'unknown' | 'preserved' | 'impaired';
  activity: 'unknown' | '0' | '1-2' | '3-4';
  invasion: 'unknown' | 'yes' | 'no';
  spread: 'unknown' | 'yes' | 'no';
}
export interface TreatmentResult {
  status: Status; reason: string; rule: string; visual: boolean;
  variant: 'resection' | 'transplant';
}
export type ChoiceKey = Exclude<keyof CaseInput, 'size'>;
// Educational subset of Reig et al., BCLC 2022, pp. 682–686.
// Deliberately returns uncertainty instead of deriving uncollected clinical facts.
export const treatments: {id: TreatmentId; name: string; short: string; icon: string}[] = [
  {id:'surgery', name:'Surgery', short:'Remove or replace', icon:'surgery'},
  {id:'ablation', name:'Ablation', short:'Treat with heat', icon:'ablation'},
  {id:'artery', name:'Artery treatment', short:'Reach it through an artery', icon:'artery'},
  {id:'medicines', name:'Medicines', short:'Work through the bloodstream', icon:'medicines'}
];
export const blankCase: CaseInput = {count:'unknown',size:'',region:'unknown',liver:'unknown',activity:'unknown',invasion:'unknown',spread:'unknown'};
export const samples: Record<string, CaseInput> = {
  small:{...blankCase,count:'1',size:'2.5',region:'right',liver:'preserved',activity:'0',invasion:'no',spread:'no'},
  multiple:{...blankCase,count:'4+',size:'4',region:'both',liver:'preserved',activity:'0',invasion:'no',spread:'no'},
  advanced:{...blankCase,count:'2',size:'5',region:'left',liver:'preserved',activity:'1-2',invasion:'yes',spread:'yes'},
  unknown:{...blankCase}
};
export const options: Record<ChoiceKey, [string, string][]> = {
  count:[['unknown','Not sure'],['1','1 tumour'],['2','2 tumours'],['3','3 tumours'],['4+','4 or more'],['diffuse','Diffuse / infiltrative disease']],
  region:[['unknown','Not sure'],['right','Right lobe'],['left','Left lobe'],['both','Both lobes']],
  liver:[['unknown','Not sure'],['preserved','Preserved / compensated'],['impaired','Impaired / decompensated']],
  activity:[['unknown','Not sure / cause unclear'],['0','Fully active (ECOG 0)'],['1-2','Some limits, up most of the day (1–2)'],['3-4','Bed or chair most of the day (3–4)']],
  invasion:[['unknown','Not sure'],['no','No'],['yes','Yes']],
  spread:[['unknown','Not sure'],['no','No'],['yes','Yes']]
};
export function validateCase(c: CaseInput) {
  if (!c || typeof c !== 'object') return 'Enter a case first.';
  for(const key of (Object.keys(options) as ChoiceKey[])) if(!options[key].some(([value])=>value===c[key])) return 'Choose a listed value for '+key+'.';
  if(c.size!=='' && (!Number.isFinite(Number(c.size)) || Number(c.size)<=0 || Number(c.size)>30)) return 'Enter a size above 0 and up to 30 cm, or leave it blank if unknown. Larger values are outside this prototype.';
  if(c.count==='1' && c.region==='both') return 'For one tumour, choose its right or left lobe, or Not sure. A tumour crossing lobes needs assessment beyond this prototype.';
  return null;
}
const result = (status: Status,reason: string,rule: string,visual=true,variant: 'resection' | 'transplant'='resection'): TreatmentResult => ({status,reason,rule,visual,variant});
export function evaluate(c: CaseInput,id: TreatmentId): TreatmentResult {
  if(!treatments.some(t=>t.id===id)) throw new Error('Unknown treatment');
  const error=validateCase(c); if(error) throw new Error(error);
  const yes=c.invasion==='yes'||c.spread==='yes';
  if(c.liver==='impaired'||c.activity==='3-4') return result('assess','Liver function or daily function needs individual review, including transplant eligibility and supportive care.','Clinical assessment takes priority.',false);
  if(c.liver==='unknown'||c.activity==='unknown') return result('unknown','Liver function and cancer-related daily function are needed for this comparison.','Missing information stays unknown.',false);
  if(yes && id!=='medicines') return result('not','Vessel invasion or spread is outside this prototype’s initial local-treatment pathway. Specialist exceptions are not modelled.','Vessel invasion / spread recorded.',false);
  if(yes && id==='medicines') return result('discuss','Vessel invasion or spread fits the broad systemic-treatment pattern. Drug suitability still needs review.','Preserved liver function; ECOG 0–2; invasion or spread.');
  if(c.invasion==='unknown'||c.spread==='unknown') return result('unknown','Whether cancer involves major vessels or has spread is needed for this comparison.','Extent of disease is unknown.',false);
  if(c.activity==='1-2') return result('assess','Cancer-related limitations need assessment before choosing a pathway.','No automatic stage is assigned.',false);
  if(c.count==='unknown') return result('unknown','The number or pattern of tumours is needed for this comparison.','Tumour burden is unknown.',false);
  if(c.count==='diffuse') return id==='medicines'
    ?result('discuss','Diffuse, infiltrative disease fits the broad systemic-treatment pattern. Drug suitability still needs review.','Diffuse disease; preserved function; ECOG 0.')
    :id==='artery'?result('not','Diffuse, infiltrative disease does not fit the BCLC TACE pathway.','Diffuse disease recorded.',false)
    :result('assess','This disease pattern is beyond the local-treatment rules in this prototype.','Individual assessment needed.',false);
  const size=c.size===''?null:Number(c.size);
  const early=c.count==='1'||(['2','3'].includes(c.count)&&size!==null&&size<=3);
  if(id==='surgery') {
    if(c.count==='1') return result('discuss','A single tumour fits a surgery discussion. Portal pressure, remaining liver and transplant eligibility are unassessed.','Single tumour; preserved function; ECOG 0.');
    if(early) return result('discuss','This small, multiple-tumour pattern fits a transplant discussion. Eligibility is unassessed.','2–3 tumours, each ≤3 cm; preserved function; ECOG 0.',true,'transplant');
    return result('assess','Transplant and downstaging criteria are not collected here.','Surgery cannot be assessed from these facts alone.',false);
  }
  if(id==='ablation') {
    if(size===null) return result('unknown','Largest tumour size is needed for the small-tumour comparison.','Size is unknown.',false);
    if(c.count==='1'&&size<=3) return result('discuss','A single tumour up to 3 cm fits an ablation discussion. Imaging must establish safe access.','Single tumour ≤3 cm; preserved function; ECOG 0.');
    return result('assess','This is outside our simple single-tumour, ≤3 cm example; combined or alternative approaches need assessment.','Size alone is not an absolute exclusion.',false);
  }
  if(id==='artery') return result('assess','TACE selection needs portal blood flow, selective artery access and transplant assessment—none are entered here.','The animation explains the mechanism only.',true);
  if(early) return result('not','Local options are usually explored first in this pattern. Medicines may enter later if those are unsuitable or unsuccessful.','This prototype does not assess treatment sequencing.',false);
  return result('assess','Medicine selection depends on whether local treatments are suitable. That assessment is missing here.','No automatic systemic-treatment recommendation.',true);
}
export const explanation: Record<TreatmentId, string[]> = {
  surgery:['Resection removes the tumour-bearing part of the liver. Transplant replaces the liver with a donated one. Both aim to remove cancer.','The operation and recovery depend on liver reserve, tumour pattern and transplant eligibility. Cancer can return; follow-up is needed.'],
  ablation:['A probe delivers heat to destroy a small tumour and a surrounding treatment zone. Imaging guides placement.','The aim is local tumour destruction. Nearby organs, vessels and bile ducts matter; repeat treatment or follow-up may be needed.'],
  artery:['TACE carries cancer medicine and blocking particles through a catheter into tumour-feeding arteries. It targets their supply, not automatically the whole liver.','The aim is tumour control. Liver reserve and blood flow matter, and treatment may need repeating.'],
  medicines:['Immunotherapy or targeted medicines travel through the bloodstream and act against cancer, including beyond the liver.','The aim is disease control. Benefits and side effects vary; the care team selects and monitors treatment.']
};
