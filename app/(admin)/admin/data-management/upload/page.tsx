import PageHeader from '@/components/shell/page-header';
import Panel from '@/components/ui/panel';
import UploadForm from './upload-form';
export default function UploadPage() { return <><PageHeader eyebrow="DATA MANAGEMENT" title="File Upload" description="파일을 먼저 staging에서 검증한 뒤 승인된 행만 RAW에 적재합니다." /><Panel><UploadForm /></Panel></>; }
