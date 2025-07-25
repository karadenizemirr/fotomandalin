// 🔧 Decimal Serialization Helper
export default  function serializeDecimalFields(data: any): any {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(serializeDecimalFields);
    }

    if (typeof data === 'object') {
        const serialized: any = {};
        for (const [key, value] of Object.entries(data)) {
            // Decimal alanlarını string'e dönüştür
            if (value && typeof value === 'object' && 'toString' in value &&
                (key.includes('Price') || key.includes('price') || key === 'basePrice' || key === 'discountPrice')) {
                serialized[key] = value.toString();
            } else if (typeof value === 'object') {
                serialized[key] = serializeDecimalFields(value);
            } else {
                serialized[key] = value;
            }
        }
        return serialized;
    }

    return data;
}

