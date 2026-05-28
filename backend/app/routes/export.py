import io
from flask import Blueprint, request, send_file, jsonify
from flask_jwt_extended import jwt_required
from ..models import Student, Prediction
from .. import db

export_bp = Blueprint('export', __name__)


def gather_rows(class_id=None, risk_status=None):
    # For now class_id is unused — placeholder for future filtering
    students = Student.query.all()
    rows = []
    for s in students:
        pred = Prediction.query.filter_by(student_id=s.id).order_by(Prediction.created_at.desc()).first()
        rows.append({
            'nama': s.nama_siswa,
            'nisn': s.nisn,
            'predicted_score': pred.predicted_exam_score if pred else None,
            'risk_status': pred.risk_status if pred else None,
        })

    if risk_status:
        rows = [r for r in rows if r['risk_status'] == risk_status]

    return rows


@export_bp.route('/pdf', methods=['GET'])
@jwt_required()
def export_pdf():
    try:
        class_id = request.args.get('class_id')
        risk_status = request.args.get('risk_status')
        rows = gather_rows(class_id, risk_status)

        # Generate PDF using reportlab
        from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Spacer
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph('Laporan Prediksi Performa Siswa', styles['Title']))
        story.append(Spacer(1, 12))

        data = [['Nama', 'NISN', 'Prediksi Skor', 'Status Risiko']]
        for r in rows:
            data.append([r['nama'], r['nisn'], '' if r['predicted_score'] is None else f"{r['predicted_score']}", r['risk_status'] or ''])

        table = Table(data, hAlign='LEFT')
        table.setStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ])
        story.append(table)

        # Summary
        story.append(Spacer(1, 12))
        total = len(rows)
        avg = None
        scores = [r['predicted_score'] for r in rows if r['predicted_score'] is not None]
        if scores:
            avg = sum(scores) / len(scores)
        story.append(Paragraph(f'Total siswa: {total}', styles['Normal']))
        story.append(Paragraph(f'Rata-rata skor (prediksi): {"-" if avg is None else f"{avg:.2f}"}', styles['Normal']))

        doc.build(story)
        buffer.seek(0)
        return send_file(buffer, mimetype='application/pdf', as_attachment=True, download_name='laporan_prediksi.pdf')
    except Exception as e:
        return jsonify({'message': 'Gagal membuat PDF', 'error': str(e)}), 500


@export_bp.route('/excel', methods=['GET'])
@jwt_required()
def export_excel():
    try:
        class_id = request.args.get('class_id')
        risk_status = request.args.get('risk_status')
        rows = gather_rows(class_id, risk_status)

        from openpyxl import Workbook

        wb = Workbook()
        ws = wb.active
        ws.title = 'Laporan Prediksi'

        ws.append(['Nama', 'NISN', 'Prediksi Skor', 'Status Risiko'])
        for r in rows:
            ws.append([r['nama'], r['nisn'], r['predicted_score'] or '', r['risk_status'] or ''])

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return send_file(buffer, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, download_name='laporan_prediksi.xlsx')
    except Exception as e:
        return jsonify({'message': 'Gagal membuat Excel', 'error': str(e)}), 500
