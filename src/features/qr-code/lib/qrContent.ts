export type QrContentType='text'|'url'|'wifi'|'contact'|'email'
export interface QrForm {type:QrContentType;text:string;ssid:string;password:string;encryption:string;name:string;phone:string;email:string;subject:string}

// 结构化二维码遵循通用文本约定，使手机系统扫码后能直接识别 Wi-Fi、联系人或邮件。
export function buildQrContent(form:QrForm):string{
  if(form.type==='wifi')return `WIFI:T:${form.encryption};S:${escapeField(form.ssid)};P:${escapeField(form.password)};;`
  if(form.type==='contact')return `MECARD:N:${escapeField(form.name)};TEL:${escapeField(form.phone)};EMAIL:${escapeField(form.email)};;`
  if(form.type==='email')return `mailto:${form.email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(form.text)}`
  return form.text
}
function escapeField(value:string){return value.replace(/([\\;,:"])/g,'\\$1')}

