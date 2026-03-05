import React, { useCallback, useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Settings, Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const HTTP_METHODS = [
    { value: 'GET', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    { value: 'POST', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    { value: 'PUT', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
    { value: 'PATCH', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
    { value: 'DELETE', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
];

export const WebhookNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('headers');
    const [urlError, setUrlError] = useState('');
    const [bodyError, setBodyError] = useState('');
    const [bodyRaw, setBodyRaw] = useState('');

    const webhookData = data.originalData?.data || {};
    const method = webhookData.method || 'GET';
    const url = webhookData.url || '';
    const headersRaw = webhookData.headers || {};
    const headers = Array.isArray(headersRaw) ? headersRaw : Object.entries(headersRaw).map(([k, v]) => ({ id: uuidv4(), key: k, value: v }));
    const paramsRaw = webhookData.params || {};
    const params = Array.isArray(paramsRaw) ? paramsRaw : Object.entries(paramsRaw).map(([k, v]) => ({ id: uuidv4(), key: k, value: v }));
    const pathVarsRaw = webhookData.path_variables || {};
    const pathVariables = Array.isArray(pathVarsRaw) ? pathVarsRaw : Object.entries(pathVarsRaw).map(([k, v]) => ({ id: uuidv4(), key: k, value: v }));
    const body = webhookData.body || {};
    const responseVariable = webhookData.response_variable || '';

    const isValidUrl = (str) => {
        const cleaned = str.replace(/\{\{[^}]+\}\}/g, 'placeholder');
        try { new URL(cleaned); return true; } catch { return false; }
    };

    useEffect(() => {
        if (isOpen) {
            if (typeof body === 'object' && Object.keys(body).length > 0) {
                setBodyRaw(JSON.stringify(body, null, 2));
            } else if (typeof body === 'string') {
                setBodyRaw(body);
            } else {
                setBodyRaw('');
            }
            setBodyError('');
            setUrlError(url && !isValidUrl(url) ? 'Invalid URL format' : '');
        }
    }, [isOpen, body, url]);

    const headerCount = headers.filter(h => h.key).length;

    const updateWebhookData = useCallback((updates) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                const newData = { ...node.data.originalData?.data, ...updates };
                const urlDisplay = newData.url
                    ? (newData.url.length > 25 ? newData.url.substring(0, 25) + '...' : newData.url)
                    : 'API Call';
                return {
                    ...node,
                    data: {
                        ...node.data,
                        subtext: `${newData.method || 'GET'} \u2022 ${urlDisplay}`,
                        originalData: {
                            ...node.data.originalData,
                            data: newData
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    const handleMethodChange = useCallback((val) => {
        updateWebhookData({ method: val });
    }, [updateWebhookData]);

    const handleUrlChange = useCallback((e) => {
        const val = e.target.value;
        setUrlError(val && !isValidUrl(val) ? 'Invalid URL format' : '');
        updateWebhookData({ url: val });
    }, [updateWebhookData]);

    const handleResponseVarChange = useCallback((e) => {
        updateWebhookData({ response_variable: e.target.value });
    }, [updateWebhookData]);

    // --- Headers ---
    const handleAddHeader = useCallback(() => {
        updateWebhookData({ headers: [...headers, { id: uuidv4(), key: '', value: '' }] });
    }, [headers, updateWebhookData]);

    const handleHeaderChange = useCallback((index, field, value) => {
        const newHeaders = [...headers];
        if (!newHeaders[index]) return;
        newHeaders[index] = { ...newHeaders[index], [field]: value };
        updateWebhookData({ headers: newHeaders });
    }, [headers, updateWebhookData]);

    const handleRemoveHeader = useCallback((index) => {
        updateWebhookData({ headers: headers.filter((_, i) => i !== index) });
    }, [headers, updateWebhookData]);

    // --- Params ---
    const handleAddParam = useCallback(() => {
        updateWebhookData({ params: [...params, { key: '', value: '' }] });
    }, [params, updateWebhookData]);

    const handleParamChange = useCallback((index, field, value) => {
        const newParams = [...params];
        newParams[index] = { ...newParams[index], [field]: value };
        updateWebhookData({ params: newParams });
    }, [params, updateWebhookData]);

    const handleRemoveParam = useCallback((index) => {
        updateWebhookData({ params: params.filter((_, i) => i !== index) });
    }, [params, updateWebhookData]);

    // --- Path Variables ---
    const handleAddPathVar = useCallback(() => {
        updateWebhookData({ path_variables: [...pathVariables, { id: uuidv4(), key: '', value: '' }] });
    }, [pathVariables, updateWebhookData]);

    const handlePathVarChange = useCallback((index, field, value) => {
        const newVars = [...pathVariables];
        newVars[index] = { ...newVars[index], [field]: value };
        updateWebhookData({ path_variables: newVars });
    }, [pathVariables, updateWebhookData]);

    const handleRemovePathVar = useCallback((index) => {
        updateWebhookData({ path_variables: pathVariables.filter((_, i) => i !== index) });
    }, [pathVariables, updateWebhookData]);

    // --- Body ---
    const handleBodyChange = useCallback((e) => {
        const raw = e.target.value;
        setBodyRaw(raw);
        if (!raw.trim()) {
            setBodyError('');
            updateWebhookData({ body: {} });
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            setBodyError('');
            updateWebhookData({ body: parsed });
        } catch {
            setBodyError('Invalid JSON format');
            updateWebhookData({ body: raw });
        }
    }, [updateWebhookData]);

    const methodColor = HTTP_METHODS.find(m => m.value === method)?.color || '';
    const showBody = ['POST', 'PUT', 'PATCH'].includes(method);

    return (
        <>
            <div
                className="flex flex-col gap-2 mt-2 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
            >
                {url ? (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${methodColor}`}>
                                {method}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[140px]">{url}</span>
                        </div>
                        {headerCount > 0 && (
                            <span className="text-[10px] text-muted-foreground">{headerCount} header(s)</span>
                        )}
                        {responseVariable && (
                            <span className="text-[10px] text-muted-foreground">\u2192 {responseVariable}</span>
                        )}
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-md hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <Settings className="h-4 w-4 mx-auto mb-1 opacity-50" />
                        Click to configure webhook
                    </div>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[580px]">
                    <DialogHeader>
                        <DialogTitle>Configure Webhook</DialogTitle>
                        <DialogDescription>
                            Set up the HTTP request for this webhook node.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2 max-h-[500px] overflow-y-auto">
                        {/* Method + URL */}
                        <div className="flex flex-col gap-1">
                            <div className="flex gap-2">
                                <Select value={method} onValueChange={handleMethodChange}>
                                    <SelectTrigger className="h-9 w-[110px] text-xs font-semibold shrink-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {HTTP_METHODS.map(m => (
                                            <SelectItem key={m.value} value={m.value} className="text-xs font-semibold">
                                                {m.value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    value={url}
                                    onChange={handleUrlChange}
                                    className={`text-xs h-9 flex-1 ${urlError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    placeholder="https://api.example.com/endpoint"
                                />
                            </div>
                            {urlError && <span className="text-[10px] text-red-500 ml-[118px]">{urlError}</span>}
                        </div>

                        {/* Response Variable */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs text-muted-foreground">Response Variable</Label>
                            <Input
                                value={responseVariable}
                                onChange={handleResponseVarChange}
                                className="text-xs h-8"
                                placeholder="e.g. webhook_response"
                            />
                        </div>

                        {/* Tabs: Headers / Params / Body */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-1 border-b">
                                {['headers', 'params', ...(showBody ? ['body'] : [])].map(tab => (
                                    <button
                                        key={tab}
                                        className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                        {tab === 'headers' && headerCount > 0 && (
                                            <span className="ml-1 text-[10px] bg-muted rounded-full px-1.5">{headerCount}</span>
                                        )}
                                        {tab === 'params' && (params.length + pathVariables.length) > 0 && (
                                            <span className="ml-1 text-[10px] bg-muted rounded-full px-1.5">{params.length + pathVariables.length}</span>
                                        )}
                                        {tab === 'body' && bodyError && (
                                            <span className="ml-1 text-[10px] text-red-500">{'\u26A0'}</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Headers Tab */}
                            {activeTab === 'headers' && (
                                <div className="flex flex-col gap-2">
                                    {headers.map((entry, index) => (
                                        <div key={entry.id || index} className="flex gap-2 items-center">
                                            <Input
                                                value={entry.key}
                                                onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                                                className="text-xs h-8 flex-1"
                                                placeholder="Header name"
                                            />
                                            <Input
                                                value={entry.value}
                                                onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                                                className="text-xs h-8 flex-1"
                                                placeholder="Value"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={() => handleRemoveHeader(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {headers.length === 0 && (
                                        <div className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded-md">
                                            No headers added
                                        </div>
                                    )}
                                    <Button variant="outline" size="sm" onClick={handleAddHeader} className="w-fit">
                                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Header
                                    </Button>
                                </div>
                            )}

                            {/* Params Tab */}
                            {activeTab === 'params' && (
                                <div className="flex flex-col gap-4">
                                    {/* Path Variables Section */}
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Path Variables</Label>
                                        <p className="text-[10px] text-muted-foreground -mt-1">Variables in your URL path (e.g. <code className="bg-muted px-1 rounded">:id</code>)</p>
                                        {pathVariables.map((pv, index) => (
                                            <div key={pv.id || index} className="flex gap-2 items-center">
                                                <Input
                                                    value={pv.key || ''}
                                                    onChange={(e) => handlePathVarChange(index, 'key', e.target.value)}
                                                    className="text-xs h-8 flex-1"
                                                    placeholder="e.g. id"
                                                />
                                                <Input
                                                    value={pv.value || ''}
                                                    onChange={(e) => handlePathVarChange(index, 'value', e.target.value)}
                                                    className="text-xs h-8 flex-1"
                                                    placeholder="e.g. {{session.flow_id}}"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                                                    onClick={() => handleRemovePathVar(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {pathVariables.length === 0 && (
                                            <div className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded-md">
                                                No path variables added
                                            </div>
                                        )}
                                        <Button variant="outline" size="sm" onClick={handleAddPathVar} className="w-fit">
                                            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Path Variable
                                        </Button>
                                    </div>

                                    <div className="border-t" />

                                    {/* Query Params Section */}
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Query Parameters</Label>
                                        <p className="text-[10px] text-muted-foreground -mt-1">Appended to the URL as <code className="bg-muted px-1 rounded">?key=value</code></p>
                                        {params.map((param, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <Input
                                                    value={param.key || ''}
                                                    onChange={(e) => handleParamChange(index, 'key', e.target.value)}
                                                    className="text-xs h-8 flex-1"
                                                    placeholder="Param name"
                                                />
                                                <Input
                                                    value={param.value || ''}
                                                    onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                                                    className="text-xs h-8 flex-1"
                                                    placeholder="Value"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                                                    onClick={() => handleRemoveParam(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {params.length === 0 && (
                                            <div className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded-md">
                                                No parameters added
                                            </div>
                                        )}
                                        <Button variant="outline" size="sm" onClick={handleAddParam} className="w-fit">
                                            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Parameter
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Body Tab */}
                            {activeTab === 'body' && showBody && (
                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-[10px] text-muted-foreground">JSON Body</Label>
                                    <Textarea
                                        value={bodyRaw}
                                        onChange={handleBodyChange}
                                        className={`text-xs min-h-[120px] font-mono ${bodyError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                        placeholder='{ "key": "value" }'
                                    />
                                    {bodyError && <span className="text-[10px] text-red-500">{bodyError}</span>}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button size="sm" onClick={() => setIsOpen(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
