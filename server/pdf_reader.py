import os
import tempfile

from langchain_community.document_loaders import PyPDFLoader


async def read_pdf(file):

    # =========================================
    # RESET FILE POINTER
    # =========================================

    await file.seek(0)


    # =========================================
    # READ PDF BYTES
    # =========================================

    content = await file.read()


    print("PDF NAME:")
    print(file.filename)

    print("PDF SIZE:")
    print(len(content))


    # =========================================
    # CHECK EMPTY FILE
    # =========================================

    if not content:

        raise ValueError(
            "Uploaded PDF is empty"
        )


    # =========================================
    # CREATE TEMPORARY PDF
    # =========================================

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    ) as temp_file:

        temp_file.write(content)

        temp_path = temp_file.name


    print("TEMP PDF:")
    print(temp_path)

    print("TEMP PDF SIZE:")
    print(
        os.path.getsize(
            temp_path
        )
    )


    try:

        # =====================================
        # LANGCHAIN PDF LOADER
        # =====================================

        loader = PyPDFLoader(
            temp_path
        )


        pages = loader.load()


        print(
            "NUMBER OF PAGES:",
            len(pages)
        )


        return pages


    finally:

        if os.path.exists(
            temp_path
        ):

            os.remove(
                temp_path
            )