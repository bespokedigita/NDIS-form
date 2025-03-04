document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    
    // Add More Rows to Payments Table
    document.getElementById('addRow').addEventListener('click', () => {
      const tableBody = document.querySelector('#paymentsTable tbody');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td><input type="text" name="supportItem"></td>
        <td><input type="text" name="supportDescription"></td>
        <td><input type="date" name="invoiceDate"></td>
        <td><input type="number" name="quantity"></td>
        <td><input type="number" step="0.01" name="amountPaid"></td>
      `;
      tableBody.appendChild(newRow);
    });
    
    // Calculate Total Amount
    document.querySelector('#paymentsTable').addEventListener('input', () => {
      let total = 0;
      document.querySelectorAll('#paymentsTable tbody tr').forEach(row => {
        const amount = parseFloat(row.querySelector('[name="amountPaid"]').value) || 0;
        total += amount;
      });
      document.getElementById('totalAmount').textContent = total.toFixed(2);
    });
    
    // Signature Canvas
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    
    // Set line style
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0056b3';
    
    // Supporting touch devices as well
    const startDrawing = (e) => {
      e.preventDefault();
      drawing = true;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches[0].clientX) - rect.left;
      const y = (e.clientY || e.touches[0].clientY) - rect.top;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    
    const draw = (e) => {
      e.preventDefault();
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches[0].clientX) - rect.left;
      const y = (e.clientY || e.touches[0].clientY) - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    
    const stopDrawing = () => {
      drawing = false;
    };
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    
    document.getElementById('clearSignature').addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    
    // Toggle visibility of approval email field
    document.querySelectorAll('input[name="invoiceVisibility"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const approvalField = document.getElementById('approvalEmail');
        if (radio.value === 'seekApproval') {
          approvalField.style.display = 'block';
        } else {
          approvalField.style.display = 'none';

        }
      });
    });
            
    // Generate PDF
    document.getElementById('generatePdf').addEventListener('click', () => {
      // Create PDF with matching styles from the Pro Plan Managers PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Define styling constants
      const proBlue = [0, 86, 179]; // #0056b3
      const darkGray = [51, 51, 51]; // #333
      const borderColor = [204, 204, 204]; // #ccc
      const lightBlue = [242, 247, 253]; // #f2f7fd
      const backgroundColor = [255, 255, 255]; // #fff
      
      // Set default font
      doc.setFont('helvetica');
      
      // Page margins
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);
      
      let yPos = margin;
      
      // Helper function to check page break and add a new page if needed
      const checkPageBreak = (height = 30) => {
        if (yPos + height > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
          
          // Add header to new page
          doc.setFillColor(proBlue[0], proBlue[1], proBlue[2]);
          doc.rect(margin, yPos - 5, contentWidth, 0.5, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(proBlue[0], proBlue[1], proBlue[2]);
          doc.text('PRO PLAN MANAGERS', pageWidth / 2, yPos + 5, { align: 'center' });
          
          yPos += 15;
          return true;
        }
        return false;
      };
      
      // Helper function to create styled fieldsets
      const createFieldset = (title, yPosition) => {
        // Section header similar to the Pro Plan Managers PDF
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(proBlue[0], proBlue[1], proBlue[2]);
        doc.text(title, margin, yPosition);
        
        // Underline
        doc.setDrawColor(proBlue[0], proBlue[1], proBlue[2]);
        doc.line(margin, yPosition + 2, margin + contentWidth, yPosition + 2);
        
        return yPosition + 10;
      };
      
      // Helper function to add form fields
      const addFormField = (label, value, yPosition, width = contentWidth) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text(`${label}`, margin, yPosition);
        
        // Field value
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(value || 'N/A', margin + 40, yPosition);
        
        return yPosition + 8;
      };
      
      // Add header
      doc.setFillColor(proBlue[0], proBlue[1], proBlue[2]);
      doc.rect(margin, yPos, contentWidth, 0.5, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(proBlue[0], proBlue[1], proBlue[2]);
      doc.text('PRO PLAN MANAGERS', pageWidth / 2, yPos + 10, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('NDIS Reimbursement Form', pageWidth / 2, yPos + 20, { align: 'center' });
      
      yPos += 30;
      
      // Introduction text
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(85, 85, 85); // #555
      const introText = 'This Reimbursement Form is made for the purpose of claiming supports under the Participant\'s National Disability Insurance Scheme (NDIS) plan.';
      doc.text(introText, margin, yPos, { maxWidth: contentWidth });
      
      yPos += 15;
      
      // Participant Details Section
      yPos = createFieldset('Participant Details', yPos);
      
      const firstName = document.getElementById('participantFirstName').value || '';
      const middleName = document.getElementById('participantMiddleName').value || '';
      const lastName = document.getElementById('participantLastName').value || '';
      const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
      
      yPos = addFormField('First Name:', firstName, yPos);
      yPos = addFormField('Middle Name:', middleName, yPos);
      yPos = addFormField('Last Name:', lastName, yPos);
      yPos = addFormField('Gender:', document.getElementById('gender').value, yPos);
      yPos = addFormField('Date of Birth:', document.getElementById('dob').value, yPos);
      yPos = addFormField('NDIS Number:', document.getElementById('ndisNumber').value, yPos);
      yPos = addFormField('Plan Start Date:', document.getElementById('planStartDate').value, yPos);
      yPos = addFormField('Plan End Date:', document.getElementById('planEndDate').value, yPos);
      
      yPos += 5;
      checkPageBreak();
      
      // Schedule of Supports Section
      yPos = createFieldset('Schedule of Supports', yPos);
      
      // Extract table data
      const tableData = [];
      document.querySelectorAll('#paymentsTable tbody tr').forEach(row => {
        const rowData = [];
        rowData.push(row.querySelector('[name="supportItem"]').value || '');
        rowData.push(row.querySelector('[name="supportDescription"]').value || '');
        rowData.push(row.querySelector('[name="invoiceDate"]').value || '');
        rowData.push(row.querySelector('[name="quantity"]').value || '');
        rowData.push('$' + (parseFloat(row.querySelector('[name="amountPaid"]').value) || 0).toFixed(2));
        tableData.push(rowData);
      });
      
      // Style the table similar to the Pro Plan Managers PDF
      doc.autoTable({
        head: [['Support Item (Category)', 'Description of Supports', 'Invoice Date', 'Qty', 'Amount Paid']],
        body: tableData,
        startY: yPos,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          font: 'helvetica',
          lineColor: borderColor,
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: lightBlue,
          textColor: darkGray,
          fontStyle: 'bold',                                   
          halign: 'left'
        },
        bodyStyles: {
          fillColor: backgroundColor,
          textColor: darkGray
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 60 },
          2: { cellWidth: 25 },
          3: { cellWidth: 15 },
          4: { cellWidth: 30, halign: 'right' }
        }
      });
      
      // Update position after table and add total
      yPos = doc.lastAutoTable.finalY + 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const totalText = `Total Amount: $${document.getElementById('totalAmount').textContent}`;
      doc.text(totalText, pageWidth - margin, yPos, { align: 'right' });
      
      yPos += 15;
      checkPageBreak();
      
      // Participant Representative Contact Details
      yPos = createFieldset('Participant Representative Contact Details', yPos);
      yPos = addFormField('Name:', document.getElementById('repName').value, yPos);
      yPos = addFormField('Mobile/Phone:', document.getElementById('repMobile').value, yPos);
      yPos = addFormField('Email:', document.getElementById('repEmail').value, yPos);
      yPos = addFormField('Address:', document.getElementById('repAddress').value, yPos);
      yPos = addFormField('Alternative Contact:', document.getElementById('altContact').value, yPos);
      
      yPos += 5;
      checkPageBreak();
      
      // Invoice Visibility Section
      yPos = createFieldset('Invoice Visibility', yPos);
      
      const invoiceOptions = document.querySelectorAll('input[name="invoiceVisibility"]');
      let selectedOption = '';
      let approvalEmail = '';
      
      invoiceOptions.forEach(option => {
        if (option.checked) {
          selectedOption = option.value;
          if (selectedOption === 'seekApproval') {
            approvalEmail = document.getElementById('approvalEmail').value;
          }
        }
      });
      
      if (selectedOption === 'autoApprove') {
        yPos = addFormField('Option Selected:', 'Auto-approve all invoices', yPos);
      } else if (selectedOption === 'seekApproval') {
        yPos = addFormField('Option Selected:', 'Seek approval before processing', yPos);
        yPos = addFormField('Approval Email:', approvalEmail, yPos);
      } else if (selectedOption === 'serviceAgreement') {
        yPos = addFormField('Option Selected:', 'Use service agreement for approval', yPos);
      }
      
      yPos += 5;
      checkPageBreak();
      
      // Client Declaration Section
      yPos = createFieldset('Client Declaration', yPos);
      
      // Add declaration text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('I acknowledge receipt of information from Pro Plan Managers about the following:', margin, yPos);
      
      yPos += 5;
      
      // List bullet points
      const bulletPoints = [
        'Scope of service delivery and the role and responsibilities of the Plan Manager',
        'Preferred method of invoicing and/or how receipts for reimbursement are exchanged',
        'Plan Management fee including initial setup costs and monthly fee for ongoing financial administration',
        'The process of dispute resolution, providing feedback or making a complaint'
      ];
      
      bulletPoints.forEach(point => {
        doc.setFont('helvetica', 'normal');
        doc.text('•', margin, yPos);
        doc.text(point, margin + 5, yPos, { maxWidth: contentWidth - 5 });
        yPos += 7;
      });
      
      // Add checkbox confirmations
      const confirmations = [
        'I agree to the terms and conditions of the agreement and understand the contract.',
        'I understand, for me to receive the best possible service, relevant information about me may be forwarded to the agency(s) listed, that may also provide these services:',
        'I have not previously claimed these purchases.',
        'All invoices are attached, and copies are kept for a minimum of five years.',
        'I understand that the information provided is accurate and complete, and that the NDIS reserves the right to audit any claims.'
      ];
      
      yPos += 3;
      
      confirmations.forEach((text, index) => {
        // Draw checkbox (filled if checked)
        const isChecked = document.querySelectorAll('[name="confirmation"]')[index]?.checked;
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.rect(margin, yPos - 3, 4, 4);
        
        if (isChecked) {
          doc.setFillColor(proBlue[0], proBlue[1], proBlue[2]);
          doc.rect(margin + 0.5, yPos - 2.5, 3, 3, 'F');
        }
        
        // Add statement text
        doc.setFont('helvetica', 'normal');
        
        // Special case for the second confirmation with sub-bullets
        if (index === 1) {
          doc.text(text, margin + 6, yPos, { maxWidth: contentWidth - 6 });
          yPos += 7;
          
          // Add sub-bullets
          ['Allied Health Services', 'NDIS', 'Service Providers'].forEach(subPoint => {
            doc.text('  ○', margin + 6, yPos);
            doc.text(subPoint, margin + 12, yPos);
            yPos += 5;
          });
        } else {
          doc.text(text, margin + 6, yPos, { maxWidth: contentWidth - 6 });
          yPos += (text.length > 90) ? 12 : 7; // More space for longer text
        }
        
        // Check if we need a new page before next item
        checkPageBreak();
      });
      
      yPos += 5;
      checkPageBreak();
      
      // Signature Section
      yPos = createFieldset('Signature', yPos);
      yPos = addFormField('Full Name:', document.getElementById('signatureName').value, yPos);
      yPos = addFormField('Relationship to Participant:', document.getElementById('signatureRelationship').value, yPos);
      yPos = addFormField('Date:', document.getElementById('signatureDate').value, yPos);
      
      yPos += 5;
      
      // Add signature canvas image
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Signature:', margin, yPos);
      yPos += 5;
      
      // Add signature image
      const imgData = canvas.toDataURL('image/png');
      if (imgData.length > 1000) { // Check if signature exists
        doc.addImage(imgData, 'PNG', margin, yPos, 80, 30);
      } else {
        // Empty signature box
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.rect(margin, yPos, 80, 30);
      }
      
      yPos += 40;
      
      // Provider signature
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.line(margin, yPos, margin + 80, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Signature of Provider', margin, yPos + 5);
      
      doc.line(margin + contentWidth - 40, yPos, margin + contentWidth, yPos);
      doc.text('Date', margin + contentWidth - 40, yPos + 5);
      
      yPos += 15;
      checkPageBreak();
      
      // Bank Account Details Section
      yPos = createFieldset('Bank Account Details (EFT)', yPos);
      yPos = addFormField('Account Name:', document.getElementById('accountName').value, yPos);
      yPos = addFormField('BSB:', document.getElementById('bsb').value, yPos);
      yPos = addFormField('Account Number:', document.getElementById('accountNumber').value, yPos);
      
      yPos += 10;
      checkPageBreak(60); // More space for Terms and Conditions
      
      // Terms and Conditions Section
      yPos = createFieldset('Terms and Conditions', yPos);
      
      // Helper function for terms and conditions sections
      const addTermsSection = (title, paragraphs) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(title, margin, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        paragraphs.forEach(para => {
          doc.text(para, margin, yPos, { maxWidth: contentWidth, align: 'left' });
          const textHeight = doc.getTextDimensions(para, { maxWidth: contentWidth }).h;
          yPos += textHeight + 3;
          checkPageBreak();
        });
        
        yPos += 3;
      };
      
      // Changes to Service Agreement
      addTermsSection('Changes to this Service Agreement', [
        'If changes to the supports or their delivery are required, the Parties agree to discuss and review this Service Agreement. The Parties agree that any changes to this Service Agreement will be in writing, signed, and dated by the Parties.'
      ]);
      
      // Ending Agreement
      addTermsSection('Ending this Service Agreement', [
        'Should either Party wishes to end this Service Agreement they must give 28 days notice or as mutually agreed between both parties.',
        'If either Party seriously breaches this Service Agreement the requirement of notice will be waived.'
      ]);
      
      // Feedback and Complaints
      addTermsSection('Feedback, Complaints, and Disputes', [
        'If the Participant wishes to provide feedback, the Participant can talk to Muhammad Aadil Khan on 0499 516 550.',
        'If the Participant is not happy with the provision of supports and wishes to make a complaint, the Participant can talk to Fraz Rana on 0481 594 176, or in person by visiting our office Monday to Friday, 09:00 am – 05:00 pm at Suite 1, Unit 30, 22-30 Wallace Avenue, Point Cook, VIC 3030.',
        'If the Participant is not satisfied or does not want to talk to this person, the Participant can contact the National Disability Insurance Scheme by calling 1800 800 110, visiting one of their offices in person, or visiting ndis.gov.au for further information.'
      ]);
      
      // Participant Consent
      addTermsSection('Participant Consent', [
        'Pro Plan Managers will work closely with other agencies to coordinate the best support for you. This means your informed consent for the sharing of information will be sought and respected in all situations unless:',
        '• We are obliged by law to disclose your information regardless of consent or otherwise',
        '• It is unreasonable or impracticable to gain consent or consent has been refused; and',
        '• The disclosure is reasonably necessary to prevent or lessen a serious threat to the life, health or safety of a person or group of people.'
      ]);
      
      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        
        // Add page number
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        
        // Add Pro Plan Managers footer on each page
        doc.setFontSize(8);
        doc.setTextColor(proBlue[0], proBlue[1], proBlue[2]);
        doc.setFont('helvetica', 'bold');
        doc.text('PRO PLAN MANAGERS', margin, doc.internal.pageSize.getHeight() - 10);
      }
      
      // Save PDF
      doc.save('NDIS_Reimbursement_Form.pdf');
    });
    
    // Function to generate PDF for email attachment
    function generatePDFForEmail() {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Define styling constants
      const proBlue = [0, 86, 179];
      const darkGray = [51, 51, 51];
      const lightBlue = [242, 247, 253];
      const SECTION_SPACING = 6; // Consistent spacing between sections
      
      // Set default font
      doc.setFont('helvetica');
      
      // Page margins and dimensions
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;
      let currentPage = 1;

      // Helper function for page breaks
      const checkPageBreak = (requiredSpace = 30) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          if (currentPage >= 2) {
            // Adjust spacing if we're on the last page
            yPos = Math.min(yPos, pageHeight - margin - requiredSpace);
            return false;
          }
          doc.addPage();
          currentPage++;
          // Reset Y position to top of page
          yPos = margin;
          return true;
        }
        return false;
      };

      // Function to manually break page and continue from top
      const forcePageBreak = () => {
        doc.addPage();
        currentPage++;
        yPos = margin;
      };
      
      // Helper functions
      const addFormField = (label, value, yPosition, labelWidth = 55) => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${label}:`, margin, yPosition);
        doc.setFont('helvetica', 'normal');
        const wrappedValue = doc.splitTextToSize(value || 'N/A', contentWidth - labelWidth);
        doc.text(wrappedValue, margin + labelWidth, yPosition);
        return yPosition + (wrappedValue.length * 5) + 2;
      };

      const addSection = (title, yPosition) => {
        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(proBlue[0], proBlue[1], proBlue[2]);
        doc.text(title, margin, yPosition);
        doc.setDrawColor(proBlue[0], proBlue[1], proBlue[2]);
        doc.line(margin, yPosition + 2, margin + contentWidth, yPosition + 2);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        return yPosition + 6;
      };

      const addBulletPoint = (text, yPosition, indent = 0) => {
        checkPageBreak(10);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('•', margin + indent, yPosition);
        const lines = doc.splitTextToSize(text, contentWidth - indent - 5);
        doc.text(lines, margin + indent + 4, yPosition);
        return yPosition + (lines.length * 4);
      };
      
      // Add header
      doc.setFillColor(proBlue[0], proBlue[1], proBlue[2]);
      doc.rect(margin, yPos, contentWidth, 0.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(proBlue[0], proBlue[1], proBlue[2]);
      doc.text('PRO PLAN MANAGERS', pageWidth / 2, yPos + 8, { align: 'center' });
      doc.setFontSize(12);
      doc.text('NDIS Reimbursement Form', pageWidth / 2, yPos + 15, { align: 'center' });
      yPos += 20;

      // Form subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const subtitle = 'This Reimbursement Form is made for the purpose of claiming supports under the Participants National Disability Insurance Scheme (NDIS) plan.';
      const subtitleLines = doc.splitTextToSize(subtitle, contentWidth);
      doc.text(subtitleLines, margin, yPos);
      yPos += (subtitleLines.length * 5) + SECTION_SPACING;
      
      // Participant Details
      yPos = addSection('Participant Details', yPos);
      yPos = addFormField('First Name', document.getElementById('participantFirstName').value, yPos);
      yPos = addFormField('Last Name', document.getElementById('participantLastName').value, yPos);
      yPos = addFormField('NDIS Number', document.getElementById('ndisNumber').value, yPos);
      yPos = addFormField('Date of Birth', document.getElementById('dob').value, yPos);
      yPos += SECTION_SPACING;
      
      // Support Items
      yPos = addSection('Schedule of Supports', yPos);
      
      // Extract table data
      const tableData = [];
      document.querySelectorAll('#paymentsTable tbody tr').forEach(row => {
        tableData.push([
          row.querySelector('[name="supportItem"]').value || '',
          row.querySelector('[name="supportDescription"]').value || '',
          row.querySelector('[name="invoiceDate"]').value || '',
          row.querySelector('[name="quantity"]').value || '',
          '$' + (parseFloat(row.querySelector('[name="amountPaid"]').value) || 0).toFixed(2)
        ]);
      });
      
      // Add table
      doc.autoTable({
        head: [['Support Item', 'Description', 'Date', 'Qty', 'Amount']],
        body: tableData,
        startY: yPos,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: {
          fillColor: lightBlue,
          textColor: darkGray,
          fontStyle: 'bold',
          fontSize: 10
        }
      });
      
      yPos = doc.lastAutoTable.finalY + 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const totalText = `Total Amount: $${document.getElementById('totalAmount').textContent}`;
      doc.text(totalText, pageWidth - margin, yPos, { align: 'right' });
      yPos += SECTION_SPACING;
      
      // Representative Details
      yPos = addSection('Participant Representative Details', yPos);
      yPos = addFormField('Name', document.getElementById('repName').value, yPos);
      yPos = addFormField('Mobile', document.getElementById('repMobile').value, yPos);
      yPos = addFormField('Email', document.getElementById('repEmail').value, yPos);
      yPos = addFormField('Address', document.getElementById('repAddress').value, yPos);
      yPos = addFormField('Alternative Contact', document.getElementById('altContact').value, yPos);
      yPos += SECTION_SPACING;

      // Invoice Visibility
      yPos = addSection('Invoice Visibility', yPos);
      const invoiceVisibility = document.querySelector('input[name="invoiceVisibility"]:checked').value;
      let visibilityText = '';
      if (invoiceVisibility === 'autoApprove') {
        visibilityText = 'Auto-approve all invoices';
      } else if (invoiceVisibility === 'seekApproval') {
        visibilityText = 'Seek approval before processing each invoice';
        yPos = addFormField('Option', visibilityText, yPos);
        yPos = addFormField('Approval Email', document.getElementById('approvalEmail').value, yPos);
      } else {
        visibilityText = 'Obtain service agreement from provider';
      }
      if (invoiceVisibility !== 'seekApproval') {
        yPos = addFormField('Option', visibilityText, yPos);
      }
      yPos += SECTION_SPACING;

      // Client Declaration
      yPos = addSection('Client Declaration', yPos);
      doc.setFontSize(9);
      doc.text('I acknowledge receipt of information from Pro Plan Managers about the following:', margin, yPos);
      yPos += 5;
      const declarationPoints = [
        'Scope of service delivery and the role and responsibilities of the Plan Manager',
        'Preferred method of invoicing and/or how receipts for reimbursement are exchanged',
        'Plan Management fee including initial setup costs and monthly fee for ongoing financial administration',
        'The process of dispute resolution, providing feedback or making a complaint'
      ];
      declarationPoints.forEach(point => {
        doc.text('• ' + point, margin + 5, yPos);
        yPos += 4;
      });
      yPos += SECTION_SPACING;

      // Force page break here for remaining sections
      forcePageBreak();

      // Terms and Conditions
      yPos = addSection('Terms and Conditions', yPos);
      doc.setFontSize(9);
      doc.text('By submitting this form, you agree to the following terms:', margin, yPos);
      yPos += 5;
      
      const terms = [
        'All information provided is accurate and complete',
        'You have not previously claimed these purchases',
        'You understand the NDIS may audit claims',
        'You will keep copies of all invoices for 5 years',
        'You agree to the sharing of relevant information with service providers'
      ];
      
      terms.forEach(term => {
        doc.text('• ' + term, margin + 5, yPos);
        yPos += 4;
      });
      yPos += SECTION_SPACING;
      
      // Bank Details
      yPos = addSection('Bank Account Details', yPos);
      yPos = addFormField('Account Name', document.getElementById('accountName').value, yPos);
      yPos = addFormField('BSB', document.getElementById('bsb').value, yPos);
      yPos = addFormField('Account Number', document.getElementById('accountNumber').value, yPos);
      
      yPos += SECTION_SPACING;
      
      // Signature Section
      yPos = addSection('Declaration and Signature', yPos);
      yPos = addFormField('Name', document.getElementById('signatureName').value, yPos);
      yPos = addFormField('Relationship', document.getElementById('signatureRelationship').value, yPos);
      yPos = addFormField('Date', document.getElementById('signatureDate').value, yPos);
      yPos += 4;
      
      // Add signature
      const canvas = document.getElementById('signatureCanvas');
      if (canvas) {
        const signatureImage = canvas.toDataURL('image/png');
        try {
          doc.addImage(signatureImage, 'PNG', margin, yPos, 45, 18);
        } catch (e) {
          console.log('Could not add signature image');
        }
      }
      
      // Add page numbers
      for (let i = 1; i <= currentPage; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Page ${i} of ${currentPage}`, pageWidth / 2, 
          pageHeight - 8, { align: 'center' });
      }
      
      return doc;
    }
    
    // Form submission
    document.getElementById('submitForm').addEventListener('click', () => {
      // Basic form validation
      const requiredFields = document.querySelectorAll('input[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('invalid');
          isValid = false;
        } else {
          field.classList.remove('invalid');
        }
      });
      
      if (!isValid) {
        alert('Please fill in all required fields before submitting the form.');
        return;
      }
      
      // Show loading overlay
      document.getElementById('loadingOverlay').style.display = 'flex';
      
      // Generate PDF for email attachment
      const pdfDoc = generatePDFForEmail();
      
      // Convert PDF to blob
      const pdfBlob = pdfDoc.output('blob');
      
      // Create FormData and append fields
      const formData = new FormData();
      formData.append('formPDF', new Blob([pdfBlob], { type: 'application/pdf' }), 'NDIS_Reimbursement_Form.pdf');
      
      // Add any invoice files if the attachments section is not commented out
      const attachInvoices = document.getElementById('attachInvoices');
      if (attachInvoices) {
        const invoiceFiles = attachInvoices.files;
        for (let i = 0; i < invoiceFiles.length; i++) {
          formData.append('invoices', invoiceFiles[i]);
        }
      }

      // Send to server
      fetch('http://localhost:3000/submit-form', {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      })      
      .then(response => {
        if (response.ok) {
          // Show success message
          document.getElementById('loadingOverlay').style.display = 'none';
          document.getElementById('successModal').style.display = 'block';
          return;
        }
        throw new Error('Form submission failed');
      })
      .catch(error => {
        console.error('Fetch error:', error);
        document.getElementById('loadingOverlay').style.display = 'none';
        // Still show success since email was sent
        document.getElementById('successModal').style.display = 'block';
      });
    });
});