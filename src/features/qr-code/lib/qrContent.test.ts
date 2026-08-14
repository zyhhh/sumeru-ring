import {describe,expect,it} from 'vitest';import {buildQrContent,type QrForm} from './qrContent'
const base:QrForm={type:'text',text:'hello',ssid:'',password:'',encryption:'WPA',name:'',phone:'',email:'',subject:''}
describe('二维码结构化内容',()=>{it('普通文本原样返回',()=>expect(buildQrContent(base)).toBe('hello'));it('生成 Wi-Fi 结构',()=>expect(buildQrContent({...base,type:'wifi',ssid:'My WiFi',password:'123'})).toBe('WIFI:T:WPA;S:My WiFi;P:123;;'));it('生成邮件链接并编码主题',()=>expect(buildQrContent({...base,type:'email',email:'a@example.com',subject:'你好'})).toContain('subject=%E4%BD%A0%E5%A5%BD'))})

