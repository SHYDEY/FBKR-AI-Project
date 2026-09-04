import PageHeader from '@/components/shell/page-header';
import Panel from '@/components/ui/panel';
import { listUsers } from './actions';
import UserTable from './user-table';
export default async function UsersPage() { const { rows, error } = await listUsers(); return <><PageHeader eyebrow="ADMIN" title="사용자 관리" description="사용자 역할과 활성 상태를 관리합니다." /><Panel>{error ? <p className="text-danger">조회에 실패했습니다: {error}</p> : <UserTable users={rows} />}</Panel></>; }
