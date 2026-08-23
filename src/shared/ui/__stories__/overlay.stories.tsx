import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button } from '../button';
import { Dialog } from '../dialog';
import { Field } from '../field';
import { FileUpload, type UploadedFile } from '../file-upload';
import { Input } from '../input';
import { Select } from '../select';
import { ToastProvider, useToast } from '../toast';

const meta = {
  title: 'Components/오버레이',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 다이얼로그: Story = {
  render: function DialogSamples() {
    const [open, setOpen] = useState<null | 'close' | 'member' | 'denied'>(null);

    return (
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setOpen('close')}>
          프로젝트 종료
        </Button>
        <Button variant="ghost" onClick={() => setOpen('member')}>
          인력 추가
        </Button>
        <Button variant="secondary" onClick={() => setOpen('denied')}>
          접근 권한 없음
        </Button>

        <Dialog
          open={open === 'close'}
          onOpenChange={() => setOpen(null)}
          title="프로젝트 종료"
          description="실제 종료일을 입력하면 진행상태가 '완료'로 변경됩니다. 계약 종료일은 그대로 유지됩니다."
          actions={
            <>
              <Button variant="secondary" onClick={() => setOpen(null)}>
                취소
              </Button>
              <Button variant="primary" onClick={() => setOpen(null)}>
                종료 처리
              </Button>
            </>
          }
        >
          <Field label="실제 종료일" hint="계약 시작일(2026-03-02) 이전은 선택할 수 없습니다">
            {({ id }) => <Input id={id} type="date" min="2026-03-02" />}
          </Field>
        </Dialog>

        <Dialog
          open={open === 'member'}
          onOpenChange={() => setOpen(null)}
          title="참여인력 추가"
          description="등록된 인력 중에서 선택합니다. 용역 인력을 선택하면 용역비를 입력할 수 있습니다."
          width={460}
          actions={
            <>
              <Button variant="secondary" onClick={() => setOpen(null)}>
                취소
              </Button>
              <Button variant="primary" onClick={() => setOpen(null)}>
                추가
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <Field label="참여인력">
              {({ id }) => (
                <Select id={id} defaultValue="">
                  <option value="" disabled>
                    인력을 선택하세요
                  </option>
                  <option>이하늘 (용역)</option>
                  <option>김도현 (정직원)</option>
                </Select>
              )}
            </Field>
            <Field label="역할">
              {({ id }) => <Input id={id} placeholder="예: 백엔드 개발" />}
            </Field>
            <Field label="용역비" hint="용역 인력만 입력">
              {({ id }) => <Input id={id} className="tabular text-right" placeholder="0" />}
            </Field>
          </div>
        </Dialog>

        <Dialog
          open={open === 'denied'}
          onOpenChange={() => setOpen(null)}
          title="접근 권한이 없습니다"
          description="용역 계정은 인사관리 · 거래처관리에 접근할 수 없으며, 프로젝트는 본인이 참여한 건만 확인할 수 있습니다."
          actions={
            <Button variant="primary" onClick={() => setOpen(null)}>
              확인
            </Button>
          }
        />
      </div>
    );
  },
};

function ToastDemo() {
  const { showToast } = useToast();
  return (
    <div className="flex gap-3">
      <Button variant="primary" onClick={() => showToast('변경사항을 저장했습니다.')}>
        저장
      </Button>
      <Button variant="secondary" onClick={() => showToast('용역비를 저장했습니다.')}>
        용역비 저장
      </Button>
    </div>
  );
}

export const 토스트: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
      <p className="text-muted mt-4 text-[12.5px]">우측 하단에 2.2초간 표시된다.</p>
    </ToastProvider>
  ),
};

const FILES: UploadedFile[] = [
  {
    attachmentId: 1,
    fileName: '근로계약서_최시온.pdf',
    contentType: 'application/pdf',
    sizeBytes: 389_120,
    createdAt: '2026-01-04T10:22:11+09:00',
  },
  {
    attachmentId: 2,
    fileName: '사업자등록증.png',
    contentType: 'image/png',
    sizeBytes: 412_000,
    createdAt: '2026-03-12T09:10:00+09:00',
  },
];

export const 파일업로드: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-8">
      <div>
        <div className="text-muted mb-2 text-xs">편집 가능 (정직원)</div>
        <FileUpload files={FILES} onSelect={() => {}} onOpen={() => {}} onDelete={() => {}} />
      </div>
      <div>
        <div className="text-muted mb-2 text-xs">읽기 전용 (용역)</div>
        <FileUpload files={FILES} onOpen={() => {}} readOnly />
      </div>
      <div>
        <div className="text-muted mb-2 text-xs">읽기 전용 · 문서 없음</div>
        <FileUpload files={[]} readOnly />
      </div>
    </div>
  ),
};
