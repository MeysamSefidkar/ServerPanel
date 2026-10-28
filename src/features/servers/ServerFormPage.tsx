import {useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import {ServerForm} from './components/ServerForm';
import {
    EMPTY_SERVER_FORM,
    formFromServer,
    toPhysicalInput,
    toVirtualInput,
    type ServerFormContext,
    type ServerFormValues,
} from './serverForm';
import {
    addPhysical,
    addVirtual,
    getDetail,
    getMeta,
    isBayTaken,
    isNameTaken,
    isRangeFree,
    updatePhysical,
    updateVirtual,
    useRackRows,
    useServers,
} from './serverStore';


export function ServerFormPage() {
    const {id} = useParams();
    const navigate = useNavigate();

    const editingId = id === undefined ? undefined : Number(id);
    const isEdit = editingId !== undefined;

    const servers = useServers();
    const rackRows = useRackRows();
    const [serverError, setServerError] = useState('');

    const row = isEdit ? (servers.find((s) => s.id === editingId) ?? null) : null;

    // دستگاه فیزیکی و رکی که در آن قرار دارد (فقط در ویرایش سرور فیزیکی پیدا می‌شود)
    const placement = (() => {
        if (editingId === undefined) return null;
        for (const rack of Object.values(rackRows).flat()) {
            const device = rack.devices.find((d) => d.id === editingId);
            if (device) return {device, rackName: rack.name};
        }
        return null;
    })();

    const detail = row && placement ? getDetail(placement.device, placement.rackName) : null;
    const initial: ServerFormValues = row
        ? formFromServer(row, detail, getMeta(row.id))
        : EMPTY_SERVER_FORM;


    const ctx: ServerFormContext = {
        racks: Object.values(rackRows)
            .flat()
            .map((r) => r.name),
        isNameTaken,
        isRangeFree,
        isBayTaken,
        editingId,
    };


    if (isEdit && !row) {
        return (
            <div className="glass rounded-2xl border border-line p-8 text-center">
                <p className="text-text-soft">سرور مورد نظر پیدا نشد.</p>
                <Link to="/servers" className="mt-4 inline-block text-sm text-muted underline">
                    بازگشت به لیست
                </Link>
            </div>
        );
    }

    function handleSubmit(values: ServerFormValues) {
        setServerError('');
        try {
            if (row && values.kind !== row.type) {
                throw new Error('تغییر نوع سرور (فیزیکی / مجازی) در ویرایش مجاز نیست');
            }

            if (editingId !== undefined) {
                if (values.kind === 'physical') {
                    updatePhysical(editingId, toPhysicalInput(values));
                } else {
                    updateVirtual(editingId, toVirtualInput(values, row?.ramUsage ?? 0));
                }
            } else if (values.kind === 'physical') {
                addPhysical(toPhysicalInput(values));
            } else {
                addVirtual(toVirtualInput(values));
            }

            navigate('/servers');
        } catch (e) {
            setServerError(e instanceof Error ? e.message : 'ذخیره انجام نشد');
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-text-soft">
                        {isEdit ? 'ویرایش سرور' : 'سرور جدید'}
                    </h1>
                    {row && <p className="mt-1 text-sm text-muted">{row.name}</p>}
                </div>
                <Link
                    to="/servers"
                    className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm text-text-soft transition hover:bg-white/5"
                >
                    <ArrowRight size={16}/>
                    بازگشت به لیست
                </Link>
            </header>

            <ServerForm
                key={editingId ?? 'new'}
                initial={initial}
                ctx={ctx}
                submitLabel={isEdit ? 'ذخیره تغییرات' : 'ثبت سرور'}
                serverError={serverError || undefined}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/servers')}
            />
        </div>
    );
}
